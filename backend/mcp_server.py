"""
Customer Success FTE - FastMCP Server
Incubation phase: MCP server exposing agent capabilities as tools.
Uses FastMCP for clean, decorator-based tool definitions.
"""

import json
import os
from datetime import datetime
from enum import Enum
from typing import Optional

from fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP(
    "customer-success-fte",
    description="AI Customer Success FTE — 24/7 support across Email, WhatsApp, and Web Form channels"
)


class Channel(str, Enum):
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    WEB_FORM = "web_form"


# =============================================================================
# In-memory stores for prototyping (will be replaced by PostgreSQL in production)
# =============================================================================
knowledge_base: list[dict] = []
tickets: dict[str, dict] = {}
customer_history: dict[str, list[dict]] = {}
ticket_counter = 0


def _load_knowledge_base():
    """Load product docs into memory for searching."""
    global knowledge_base
    docs_path = os.path.join(os.path.dirname(__file__), "..", "context", "product-docs.md")
    if os.path.exists(docs_path):
        with open(docs_path, "r", encoding="utf-8") as f:
            content = f.read()
        # Split by headings for chunked search
        sections = content.split("\n## ")
        for section in sections:
            if section.strip():
                lines = section.strip().split("\n")
                title = lines[0].replace("# ", "").strip()
                body = "\n".join(lines[1:]).strip()
                knowledge_base.append({
                    "title": title,
                    "content": body,
                    "keywords": title.lower().split()
                })


_load_knowledge_base()


# =============================================================================
# MCP Tools
# =============================================================================

@mcp.tool()
async def search_knowledge_base(query: str, category: Optional[str] = None) -> str:
    """
    Search product documentation for relevant information.
    Use this tool to find answers to customer questions about features, 
    troubleshooting, integrations, and how-to guides.
    
    Args:
        query: The search query or customer question
        category: Optional filter — getting_started, tasks, collaboration, 
                  integrations, api, time_tracking, analytics, troubleshooting, account
    
    Returns:
        JSON string with matching knowledge base articles
    """
    query_lower = query.lower()
    results = []

    for article in knowledge_base:
        score = 0
        title_lower = article["title"].lower()
        content_lower = article["content"].lower()

        # Title match (high weight)
        for word in query_lower.split():
            if word in title_lower:
                score += 3
            if word in content_lower:
                score += 1

        if score > 0:
            # Truncate content for response
            content_preview = article["content"][:500]
            results.append({
                "title": article["title"],
                "content": content_preview,
                "relevance_score": min(score / 10, 1.0)
            })

    # Sort by relevance
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    top_results = results[:3]

    if not top_results:
        return json.dumps({
            "results": [],
            "confident": False,
            "message": "No matching articles found. Consider escalating to human support."
        })

    return json.dumps({
        "results": top_results,
        "confident": top_results[0]["relevance_score"] > 0.5
    })


@mcp.tool()
async def create_ticket(
    customer_id: str,
    customer_name: str,
    customer_email: str,
    issue: str,
    channel: str,
    category: str = "general",
    priority: str = "medium"
) -> str:
    """
    Create a support ticket for tracking customer issues.
    ALWAYS create a ticket at the start of every customer conversation.
    
    Args:
        customer_id: Unique customer identifier
        customer_name: Customer's display name
        customer_email: Customer's email address
        issue: Description of the customer's issue
        channel: Source channel — email, whatsapp, or web_form
        category: Ticket category — general, technical, billing, bug_report, feedback
        priority: Priority level — low, medium, high, critical
        
    Returns:
        JSON string with ticket details including ticket ID
    """
    global ticket_counter
    ticket_counter += 1
    ticket_id = f"TICKET-{ticket_counter:04d}"

    ticket = {
        "ticket_id": ticket_id,
        "customer_id": customer_id,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "issue": issue,
        "channel": channel,
        "category": category,
        "priority": priority,
        "status": "open",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

    tickets[ticket_id] = ticket

    return json.dumps({
        "success": True,
        "ticket_id": ticket_id,
        "message": f"Ticket {ticket_id} created successfully"
    })


@mcp.tool()
async def get_customer_history(
    customer_id: str,
    channel: Optional[str] = None
) -> str:
    """
    Retrieve a customer's interaction history across all channels.
    Use this to provide context-aware, continuous support.
    
    Args:
        customer_id: The customer's unique identifier
        channel: Optional channel filter — email, whatsapp, web_form
    
    Returns:
        JSON string with customer's previous interactions and tickets
    """
    history = customer_history.get(customer_id, [])

    if channel:
        history = [h for h in history if h.get("channel") == channel]

    # Find related tickets
    related_tickets = [
        t for t in tickets.values()
        if t["customer_id"] == customer_id
    ]

    return json.dumps({
        "customer_id": customer_id,
        "interaction_count": len(history),
        "interactions": history[-10:],  # Last 10 interactions
        "open_tickets": [t for t in related_tickets if t["status"] == "open"],
        "total_tickets": len(related_tickets)
    })


@mcp.tool()
async def escalate_to_human(
    ticket_id: str,
    reason: str,
    urgency: str = "normal",
    summary: Optional[str] = None
) -> str:
    """
    Escalate a conversation to a human support agent.
    Use when: legal threats, billing issues, refund requests, 
    repeated failures, explicit human request, or hostile sentiment.
    
    Args:
        ticket_id: The ticket to escalate
        reason: Why this is being escalated
        urgency: Urgency level — normal, urgent, critical
        summary: Optional conversation summary for the human agent
    
    Returns:
        JSON string confirming escalation
    """
    if ticket_id in tickets:
        tickets[ticket_id]["status"] = "escalated"
        tickets[ticket_id]["escalation_reason"] = reason
        tickets[ticket_id]["escalation_urgency"] = urgency
        tickets[ticket_id]["escalation_summary"] = summary
        tickets[ticket_id]["updated_at"] = datetime.now().isoformat()

    response_times = {
        "critical": "within 1 hour",
        "urgent": "within 4 hours",
        "normal": "within 24 hours"
    }

    return json.dumps({
        "success": True,
        "ticket_id": ticket_id,
        "escalated_to": "tier_2",
        "expected_response": response_times.get(urgency, "within 24 hours"),
        "message": f"Ticket {ticket_id} escalated to human support team"
    })


@mcp.tool()
async def send_response(
    customer_id: str,
    channel: str,
    message: str,
    ticket_id: Optional[str] = None
) -> str:
    """
    Send a formatted response to the customer via their channel.
    The message will be automatically formatted according to channel conventions.
    
    Args:
        customer_id: The customer's unique identifier
        channel: Target channel — email, whatsapp, web_form
        message: The response message to send
        ticket_id: Optional ticket ID to link this response to
    
    Returns:
        JSON string confirming message delivery
    """
    # Channel-specific length limits
    limits = {
        "email": 2000,
        "whatsapp": 1600,
        "web_form": 1000
    }

    max_len = limits.get(channel, 1000)
    truncated = len(message) > max_len
    formatted_message = message[:max_len]

    # Store in history
    if customer_id not in customer_history:
        customer_history[customer_id] = []

    customer_history[customer_id].append({
        "channel": channel,
        "direction": "outbound",
        "message": formatted_message,
        "ticket_id": ticket_id,
        "timestamp": datetime.now().isoformat()
    })

    return json.dumps({
        "success": True,
        "channel": channel,
        "character_count": len(formatted_message),
        "truncated": truncated,
        "message": "Response sent successfully"
    })


# =============================================================================
# MCP Resources
# =============================================================================

@mcp.resource("config://channels")
async def get_channel_config() -> str:
    """Get channel configuration and limits."""
    return json.dumps({
        "email": {"max_length": 2000, "tone": "professional", "format": "detailed"},
        "whatsapp": {"max_length": 1600, "tone": "friendly", "format": "concise"},
        "web_form": {"max_length": 1000, "tone": "semi-formal", "format": "moderate"}
    })


@mcp.resource("config://escalation-rules")
async def get_escalation_rules() -> str:
    """Get escalation trigger rules."""
    rules_path = os.path.join(os.path.dirname(__file__), "..", "context", "escalation-rules.md")
    if os.path.exists(rules_path):
        with open(rules_path, "r", encoding="utf-8") as f:
            return f.read()
    return "Escalation rules not found."


# =============================================================================
# Entry point
# =============================================================================

if __name__ == "__main__":
    mcp.run()
