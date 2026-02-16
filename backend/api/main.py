"""
Customer Success FTE — FastAPI Service
Main REST API application with all endpoints.
"""

import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from agents import Runner

from agent.customer_success_agent import get_agent
from agent.formatters import format_response
from channels.web_form_handler import SupportFormSubmission, SupportFormResponse, TicketStatusResponse, web_form_handler
from channels.whatsapp_handler import whatsapp_handler
from channels.gmail_handler import gmail_handler
from database.queries import (
    close_pool,
    create_conversation,
    create_ticket,
    get_active_conversation,
    get_channel_metrics,
    get_customer_history,
    get_customer_tickets,
    get_pool,
    get_ticket,
    record_metric,
    resolve_customer,
    store_message,
)
from kafka_client import kafka_client
from workers.message_processor import message_processor

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# Lifespan
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    logger.info("Starting Customer Success FTE API...")
    # Initialize database pool
    await get_pool()
    # Initialize Kafka producer
    try:
        await kafka_client.start_producer()
    except Exception as e:
        logger.warning(f"Kafka not available: {e}")
    logger.info("API ready!")
    yield
    # Cleanup
    await close_pool()
    await kafka_client.stop_all()
    logger.info("API shutdown complete.")


# =============================================================================
# Application
# =============================================================================

app = FastAPI(
    title="Customer Success FTE API",
    description="24/7 AI Customer Support across Email, WhatsApp, and Web Form channels",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Health Check
# =============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes."""
    return {
        "status": "healthy",
        "service": "customer-success-fte",
        "timestamp": datetime.now().isoformat(),
    }


# =============================================================================
# Web Form Endpoints (REQUIRED — 10 points)
# =============================================================================

@app.post("/support/submit", response_model=SupportFormResponse)
async def submit_support_form(submission: SupportFormSubmission):
    """
    Submit a web support form.
    This is the REQUIRED endpoint for the Next.js frontend.
    """
    try:
        # Validate submission
        validation = web_form_handler.validate_submission(submission)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail={"errors": validation["errors"]})

        sanitized = validation["sanitized"]

        # Process through the message processor pipeline
        result = await message_processor.process_message("web_form", {
            "email": sanitized["email"],
            "name": sanitized["name"],
            "subject": sanitized["subject"],
            "message": sanitized["message"],
            "category": sanitized["category"],
            "priority": sanitized["priority"],
        })

        if result["success"]:
            # Get the ticket number from the agent's response
            # We need to look it up from the conversation
            customer = await resolve_customer(email=sanitized["email"])
            tickets = await get_customer_tickets(customer["id"])
            ticket_number = tickets[0]["ticket_number"] if tickets else "PENDING"

            return SupportFormResponse(
                success=True,
                ticket_number=ticket_number,
                message=result.get("response", web_form_handler.format_confirmation(ticket_number, sanitized["name"])),
                estimated_response_time="within 24 hours",
            )
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Processing failed"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Support form error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/support/ticket/{ticket_number}", response_model=TicketStatusResponse)
async def get_ticket_status(ticket_number: str):
    """Look up a ticket's status by ticket number."""
    ticket = await get_ticket(ticket_number)

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return TicketStatusResponse(
        ticket_number=ticket["ticket_number"],
        status=ticket["status"],
        subject=ticket.get("subject"),
        category=ticket.get("category"),
        priority=ticket.get("priority"),
        created_at=ticket.get("created_at"),
        updated_at=ticket.get("updated_at"),
        resolution_notes=ticket.get("resolution_notes"),
    )


# =============================================================================
# Gmail Webhook
# =============================================================================

@app.post("/webhooks/gmail")
async def gmail_webhook(request: Request):
    """Handle Gmail Pub/Sub push notifications."""
    try:
        body = await request.json()
        message_data = await gmail_handler.process_pubsub_notification(body)

        if message_data:
            # Publish to Kafka for async processing
            try:
                await kafka_client.publish_inbound("email", message_data)
            except Exception:
                # Fallback: process directly if Kafka is down
                await message_processor.process_message("email", message_data)

        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Gmail webhook error: {e}")
        return {"status": "error", "message": str(e)}


# =============================================================================
# WhatsApp Webhook
# =============================================================================

@app.post("/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    """Handle Twilio WhatsApp webhook."""
    logger.info("WhatsApp webhook received a request")
    try:
        form_data = await request.form()
        data = dict(form_data)

        # Parse the incoming message
        parsed = whatsapp_handler.parse_incoming_message(data)

        if parsed.get("body"):
            # Publish to Kafka for async processing
            try:
                await kafka_client.publish_inbound("whatsapp", parsed)
            except Exception:
                # Fallback: process directly
                await message_processor.process_message("whatsapp", parsed)

        # Twilio expects TwiML response
        return (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Response></Response>'
        )
    except Exception as e:
        logger.error(f"WhatsApp webhook error: {e}")
        return (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Response></Response>'
        )


# =============================================================================
# Conversation & Customer Endpoints
# =============================================================================

@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get conversation details with messages."""
    from database.queries import get_conversation_messages
    messages = await get_conversation_messages(conversation_id)
    return {"conversation_id": conversation_id, "messages": messages}


class CustomerLookupRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None


@app.post("/customers/lookup")
async def lookup_customer(request: CustomerLookupRequest):
    """Look up a customer and their history."""
    if not request.email and not request.phone:
        raise HTTPException(status_code=400, detail="Provide email or phone")

    customer = await resolve_customer(email=request.email, phone=request.phone)
    history = await get_customer_history(customer["id"])

    return {
        "customer": customer,
        "history": history,
    }


# =============================================================================
# Metrics Endpoint
# =============================================================================

@app.get("/metrics/channels")
async def channel_metrics(hours: int = 24):
    """Get channel performance metrics."""
    metrics = await get_channel_metrics(hours=hours)

    # Also provide summary stats
    summary = {
        "total_messages": 0,
        "total_escalations": 0,
        "avg_processing_time": 0,
        "channels": {},
    }

    for m in metrics:
        channel = m.get("channel", "all")
        metric_type = m.get("metric_type", "")
        count = m.get("count", 0)
        avg_val = m.get("avg_value", 0)
        
        
        # Update per-channel stats
        if channel not in summary["channels"]:
            summary["channels"][channel] = {}
        
        summary["channels"][channel][metric_type] = {
            "avg": avg_val,
            "count": count,
        }

        # Aggregate global stats
        if metric_type == "message_processed":
            summary["total_messages"] += count
        elif metric_type == "ticket_created":
            summary["tickets_created"] += count
        elif metric_type == "escalation":
            summary["total_escalations"] += count
        elif metric_type == "processing_time":
            # Weighted average for processing time
            current_total_time = summary["avg_processing_time"] * (summary["total_messages"] - count) # approximate
            # Better approach: just take the max or average of averages?
            # Simple avg of averages for now, or better:
            pass 

    # Second pass for averages if needed, or simplify:
    # Let's just sum up raw counts. For processing_time, it's tricky without raw data.
    # We'll compute weighted avg for processing time.
    
    total_processing_count = 0
    total_processing_sum = 0
    
    for m in metrics:
        if m["metric_type"] == "processing_time":
            total_processing_count += m["count"]
            total_processing_sum += m["avg_value"] * m["count"]

    if total_processing_count > 0:
        summary["avg_processing_time"] = round(total_processing_sum / total_processing_count, 2)

    # Initialize tickets_created if not present (to match frontend expectations)
    if "tickets_created" not in summary:
        summary["tickets_created"] = 0

    return {"metrics": metrics, "summary": summary}


# =============================================================================
# Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
