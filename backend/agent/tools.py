"""
Customer Success FTE — Production Tools
OpenAI Agents SDK @function_tool definitions.
Tools use flat parameters (not Pydantic input models) for Groq compatibility.
"""

import json
from typing import Optional

from agents import function_tool

from database.queries import (
    create_ticket as db_create_ticket,
    get_customer_history as db_get_customer_history,
    get_ticket,
    record_metric,
    resolve_customer,
    search_knowledge,
    store_message,
    update_ticket_status,
)


# =============================================================================
# Tool Implementations — Flat parameters for Groq tool-calling compatibility
# =============================================================================

@function_tool
async def search_knowledge_base(query: str, category: str = None) -> str:
    """
    Search product documentation for relevant information.
    Use this tool to find answers to customer questions about features,
    troubleshooting, integrations, and how-to guides.

    Args:
        query: The search query or customer question
        category: Optional filter: getting_started, tasks, collaboration, integrations, api, time_tracking, analytics, troubleshooting, account
    """
    try:
        results = await search_knowledge(query, limit=3)

        if not results:
            return json.dumps({
                "results": [],
                "confident": False,
                "message": "No matching articles found. You may need to provide general guidance."
            })

        formatted = []
        for r in results:
            formatted.append({
                "title": r.get("title", ""),
                "content": r.get("content", "")[:500],
                "category": r.get("category", ""),
                "relevance": float(r.get("rank", 0))
            })

        return json.dumps({
            "results": formatted,
            "confident": len(formatted) > 0
        })
    except Exception as e:
        return json.dumps({"error": str(e), "results": [], "confident": False})


@function_tool
async def create_ticket(
    customer_email: str,
    customer_name: str,
    issue: str,
    channel: str,
    category: str = "general",
    priority: str = "medium",
) -> str:
    """
    Create a support ticket for tracking.
    ALWAYS create a ticket at the start of every conversation.
    This ensures every customer interaction is logged and trackable.

    Args:
        customer_email: Customer's email address
        customer_name: Customer's display name
        issue: Description of the customer's issue
        channel: Source channel: email, whatsapp, or web_form
        category: Category: general, technical, billing, bug_report, feedback
        priority: Priority: low, medium, high, critical
    """
    try:
        # Resolve customer (find or create)
        customer = await resolve_customer(
            email=customer_email,
            name=customer_name
        )

        # Create the ticket
        ticket = await db_create_ticket(
            customer_id=customer["id"],
            channel=channel,
            subject=issue[:200],
            description=issue,
            category=category,
            priority=priority
        )

        # Record metric
        await record_metric("ticket_created", 1.0, channel)

        return json.dumps({
            "success": True,
            "ticket_number": ticket["ticket_number"],
            "customer_id": customer["id"],
            "is_new_customer": customer.get("is_new", False),
            "message": f"Ticket {ticket['ticket_number']} created for {customer_name}"
        })
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})


@function_tool
async def get_customer_history(
    customer_email: str = None,
    customer_phone: str = None,
) -> str:
    """
    Retrieve a customer's interaction history across all channels.
    Use this to provide context-aware, continuous support.
    Check this for returning customers to reference past conversations.

    Args:
        customer_email: Customer email for lookup
        customer_phone: Customer phone for lookup
    """
    try:
        customer = await resolve_customer(
            email=customer_email,
            phone=customer_phone
        )

        if customer.get("is_new"):
            return json.dumps({
                "customer_id": customer["id"],
                "is_new_customer": True,
                "message": "New customer — no previous history"
            })

        history = await db_get_customer_history(customer["id"])

        return json.dumps({
            "customer_id": customer["id"],
            "is_new_customer": False,
            "conversations": len(history.get("conversations", [])),
            "open_tickets": [
                {"number": t.get("ticket_number", ""), "status": t.get("status", ""), "subject": t.get("subject", "")}
                for t in history.get("open_tickets", [])
            ],
            "channels_used": list(set(
                i.get("identifier_type", "") for i in history.get("identifiers", [])
            ))
        })
    except Exception as e:
        return json.dumps({"error": str(e), "is_new_customer": True})


@function_tool
async def escalate_to_human(
    ticket_id: str,
    reason: str,
    urgency: str = "normal",
    summary: str = None,
) -> str:
    """
    Escalate a conversation to a human support agent.
    Use when encountering: legal threats, billing/refund requests,
    account deletion, GDPR requests, SSO issues, hostile sentiment,
    or explicit request for human support.

    Args:
        ticket_id: The ticket number to escalate (e.g. TICKET-0001)
        reason: Why this needs human attention
        urgency: Urgency: normal, urgent, critical
        summary: Conversation summary for the human agent
    """
    try:
        # Update ticket status
        updated = await update_ticket_status(
            ticket_id,
            "escalated",
            f"Escalation reason: {reason}"
        )

        response_times = {
            "critical": "within 1 hour",
            "urgent": "within 4 hours",
            "normal": "within 24 hours"
        }

        # Record metric
        await record_metric("escalation", 1.0, metadata={"reason": reason, "urgency": urgency})

        return json.dumps({
            "success": True,
            "ticket_id": ticket_id,
            "escalated_to": "tier_2",
            "expected_response": response_times.get(urgency, "within 24 hours"),
            "message": f"Ticket {ticket_id} escalated. Human team will respond {response_times.get(urgency, 'within 24 hours')}."
        })
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})


@function_tool
async def send_response(
    customer_email: str,
    channel: str,
    message: str,
    ticket_id: str = None,
) -> str:
    """
    Send a formatted response to the customer via their channel.
    The message will be automatically formatted according to channel conventions.
    Always use this as the final step after composing your response.

    Args:
        customer_email: Customer email to identify them
        channel: Target channel: email, whatsapp, web_form
        message: The response message to send
        ticket_id: Ticket to link this response to
    """
    try:
        # Channel length limits
        limits = {"email": 2000, "whatsapp": 1600, "web_form": 1000}
        max_len = limits.get(channel, 1000)
        
        message = message[:max_len]
        truncated = len(message) > max_len

        # Resolve customer
        customer = await resolve_customer(email=customer_email)

        # Record metric
        await record_metric("response_sent", 1.0, channel)

        return json.dumps({
            "success": True,
            "channel": channel,
            "character_count": len(message),
            "truncated": truncated,
            "message": "Response composed and ready for delivery"
        })
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})
