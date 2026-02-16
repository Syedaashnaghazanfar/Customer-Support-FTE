"""
Customer Success FTE — Groq-compatible Agent Runner
Uses OpenAI chat completions API directly (not the Responses API)
for reliable tool calling with Groq models.
"""

import json
import logging
import os
import re
from typing import Optional

from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize the Groq client via OpenAI-compatible API
_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1"),
)

# Import database functions directly (bypassing @function_tool wrappers)
from database.queries import (
    create_ticket as db_create_ticket,
    get_customer_history as db_get_customer_history,
    record_metric,
    resolve_customer,
    search_knowledge,
    update_ticket_status,
)


# =============================================================================
# Raw tool implementations (no SDK wrappers)
# =============================================================================

async def _search_knowledge_base(query: str, category: str = None, **kwargs) -> str:
    try:
        results = await search_knowledge(query, limit=3)
        if not results:
            return json.dumps({"results": [], "confident": False, "message": "No matching articles found."})
        formatted = [
            {"title": r.get("title", ""), "content": r.get("content", "")[:500], "category": r.get("category", "")}
            for r in results
        ]
        return json.dumps({"results": formatted, "confident": len(formatted) > 0})
    except Exception as e:
        return json.dumps({"error": str(e), "results": [], "confident": False})


async def _create_ticket(customer_email: str, customer_name: str, issue: str, channel: str, category: str = "general", priority: str = "medium", **kwargs) -> str:
    try:
        customer = await resolve_customer(email=customer_email, name=customer_name)
        ticket = await db_create_ticket(
            customer_id=customer["id"], channel=channel,
            subject=issue[:200], description=issue,
            category=category, priority=priority,
        )
        await record_metric("ticket_created", 1.0, channel)
        return json.dumps({
            "success": True, "ticket_number": ticket["ticket_number"],
            "customer_id": customer["id"], "is_new_customer": customer.get("is_new", False),
            "message": f"Ticket {ticket['ticket_number']} created for {customer_name}",
        })
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})


async def _get_customer_history(customer_email: str = None, customer_phone: str = None, **kwargs) -> str:
    try:
        customer = await resolve_customer(email=customer_email, phone=customer_phone)
        if customer.get("is_new"):
            return json.dumps({"customer_id": customer["id"], "is_new_customer": True, "message": "New customer"})
        history = await db_get_customer_history(customer["id"])
        return json.dumps({
            "customer_id": customer["id"], "is_new_customer": False,
            "conversations": len(history.get("conversations", [])),
            "open_tickets": [{"number": t.get("ticket_number", ""), "status": t.get("status", "")} for t in history.get("open_tickets", [])],
        })
    except Exception as e:
        return json.dumps({"error": str(e), "is_new_customer": True})


async def _escalate_to_human(ticket_id: str, reason: str, urgency: str = "normal", summary: str = None, **kwargs) -> str:
    try:
        await update_ticket_status(ticket_id, "escalated", f"Escalation reason: {reason}")
        response_times = {"critical": "within 1 hour", "urgent": "within 4 hours", "normal": "within 24 hours"}
        await record_metric("escalation", 1.0, metadata={"reason": reason, "urgency": urgency})
        return json.dumps({
            "success": True, "ticket_id": ticket_id, "escalated_to": "tier_2",
            "expected_response": response_times.get(urgency, "within 24 hours"),
        })
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})


async def _send_response(customer_email: str, channel: str, message: str, ticket_id: str = None, **kwargs) -> str:
    try:
        limits = {"email": 2000, "whatsapp": 1600, "web_form": 1000}
        max_len = limits.get(channel, 1000)
        msg = message[:max_len]
        await resolve_customer(email=customer_email)
        await record_metric("response_sent", 1.0, channel)
        return json.dumps({"success": True, "channel": channel, "character_count": len(msg), "message": "Response ready"})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})


# Map tool names to functions
TOOL_FUNCTIONS = {
    "create_ticket": _create_ticket,
    "escalate_to_human": _escalate_to_human,
    "get_customer_history": _get_customer_history,
    "search_knowledge_base": _search_knowledge_base,
    "send_response": _send_response,
}

# Tool schemas for chat completions
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": "Search product documentation for relevant information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query"},
                    "category": {"type": "string", "description": "Optional category filter"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_ticket",
            "description": "Create a support ticket. ALWAYS do this first for every conversation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_email": {"type": "string", "description": "Customer's email"},
                    "customer_name": {"type": "string", "description": "Customer's name"},
                    "issue": {"type": "string", "description": "Issue description"},
                    "channel": {"type": "string", "description": "Channel: email, whatsapp, or web_form"},
                    "category": {"type": "string", "description": "Category: general, technical, billing, bug_report, feedback"},
                    "priority": {"type": "string", "description": "Priority: low, medium, high, critical"},
                },
                "required": ["customer_email", "customer_name", "issue", "channel"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_customer_history",
            "description": "Retrieve a customer's interaction history.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_email": {"type": "string", "description": "Customer email"},
                    "customer_phone": {"type": "string", "description": "Customer phone"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "escalate_to_human",
            "description": "Escalate to a human support agent.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticket_id": {"type": "string", "description": "Ticket number (e.g. TICKET-0001)"},
                    "reason": {"type": "string", "description": "Escalation reason"},
                    "urgency": {"type": "string", "description": "Urgency: normal, urgent, critical"},
                    "summary": {"type": "string", "description": "Conversation summary"},
                },
                "required": ["ticket_id", "reason"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "send_response",
            "description": "Send a formatted response to the customer. Use as the final step.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_email": {"type": "string", "description": "Customer email"},
                    "channel": {"type": "string", "description": "Channel: email, whatsapp, web_form"},
                    "message": {"type": "string", "description": "Response message to send"},
                    "ticket_id": {"type": "string", "description": "Ticket to link response to"},
                },
                "required": ["customer_email", "channel", "message"],
            },
        },
    },
]


def _clean_message_for_groq(msg_obj) -> dict:
    """
    Convert an OpenAI SDK message object to a clean dict that Groq accepts.
    Groq rejects unknown fields like 'annotations', 'refusal', etc.
    """
    clean = {"role": msg_obj.role}

    if msg_obj.content:
        clean["content"] = msg_obj.content
    else:
        clean["content"] = ""

    if msg_obj.tool_calls:
        clean["tool_calls"] = [
            {
                "id": tc.id,
                "type": "function",
                "function": {
                    "name": tc.function.name,
                    "arguments": tc.function.arguments,
                },
            }
            for tc in msg_obj.tool_calls
        ]

    return clean


def _parse_xml_tool_calls(text: str) -> list:
    """
    Parse XML-style function calls that Groq models sometimes generate.
    Format: <function=tool_name>{"arg": "val"}</function>
    Also handles: <function=tool_name({"arg": "val"})></function>
    """
    calls = []

    # Pattern 1: <function=name>{"args": ...}</function>
    pattern1 = r'<function=(\w+)>\s*(\{[^}]*\})\s*;?\s*</function>'
    for match in re.finditer(pattern1, text, re.DOTALL):
        fn_name = match.group(1)
        try:
            fn_args = json.loads(match.group(2))
            calls.append({"name": fn_name, "args": fn_args})
        except json.JSONDecodeError:
            continue

    # Pattern 2: <function=name({"args": ...})></function>
    pattern2 = r'<function=(\w+)\((\{[^)]*\})\)\s*>\s*</function>'
    for match in re.finditer(pattern2, text, re.DOTALL):
        fn_name = match.group(1)
        try:
            fn_args = json.loads(match.group(2))
            calls.append({"name": fn_name, "args": fn_args})
        except json.JSONDecodeError:
            continue

    return calls


async def run_agent(system_prompt: str, user_message: str, max_turns: int = 10) -> str:
    """
    Run the agent using Groq's /chat/completions with tool calling.
    Includes fallback parsing for XML-style tool calls.
    """
    model = os.getenv("AGENT_MODEL", "llama-3.3-70b-versatile")
    logger.info(f"Using model: {model}")

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]

    for turn in range(max_turns):
        try:
            response = await _client.chat.completions.create(
                model=model,
                messages=messages,
                tools=TOOL_SCHEMAS,
                tool_choice="auto",
                temperature=0.7,
                max_tokens=1024,
            )
        except Exception as e:
            error_str = str(e)

            # Check if the error contains XML-style tool calls we can parse
            if "failed_generation" in error_str or "tool_use_failed" in error_str:
                logger.warning(f"Groq returned XML-style tool calls on turn {turn + 1}, attempting fallback parse")

                # Try to extract the failed generation text
                xml_calls = _parse_xml_tool_calls(error_str)
                if xml_calls:
                    # Execute the parsed tool calls and retry without tools
                    tool_results = []
                    for call in xml_calls:
                        tool_fn = TOOL_FUNCTIONS.get(call["name"])
                        if tool_fn:
                            logger.info(f"Fallback calling tool: {call['name']}")
                            try:
                                result = await tool_fn(**call["args"])
                                tool_results.append(f"Tool {call['name']}: {result}")
                            except Exception as te:
                                tool_results.append(f"Tool {call['name']} error: {te}")

                    if tool_results:
                        # Add tool results as context and retry WITHOUT tools
                        messages.append({
                            "role": "assistant",
                            "content": f"I called the following tools:\n" + "\n".join(tool_results),
                        })
                        messages.append({
                            "role": "user",
                            "content": "Based on the tool results above, please provide your final response to the customer.",
                        })

                        try:
                            # Retry without tools to get a normal text response
                            followup = await _client.chat.completions.create(
                                model=model,
                                messages=messages,
                                temperature=0.7,
                                max_tokens=1024,
                            )
                            if followup.choices[0].message.content:
                                return followup.choices[0].message.content
                        except Exception as retry_e:
                            logger.error(f"Followup after fallback failed: {retry_e}")

                logger.error(f"Groq API error on turn {turn + 1}: {e}")
                return "I apologize, but I'm experiencing a temporary issue. Please try again shortly."
            else:
                logger.error(f"Groq API error on turn {turn + 1}: {e}")
                return "I apologize, but I'm experiencing a temporary issue. Please try again shortly."

        choice = response.choices[0]
        message = choice.message

        # If the model wants to call tools via proper structured calls
        if message.tool_calls:
            # Add assistant message — cleaned to remove fields Groq doesn't support
            messages.append(_clean_message_for_groq(message))

            # Execute each tool call
            for tool_call in message.tool_calls:
                fn_name = tool_call.function.name
                try:
                    fn_args = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON args for {fn_name}")
                    messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": json.dumps({"error": "Invalid arguments"})})
                    continue

                tool_fn = TOOL_FUNCTIONS.get(fn_name)
                if tool_fn:
                    logger.info(f"Calling tool: {fn_name}")
                    try:
                        result = await tool_fn(**fn_args)
                    except Exception as e:
                        logger.error(f"Tool {fn_name} failed: {e}")
                        result = json.dumps({"error": str(e)})
                else:
                    result = json.dumps({"error": f"Unknown tool: {fn_name}"})

                messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": result})

            continue

        # Check if the text response contains XML-style tool calls
        if message.content and "<function=" in message.content:
            xml_calls = _parse_xml_tool_calls(message.content)
            if xml_calls:
                logger.info(f"Parsed {len(xml_calls)} XML-style tool calls from response text")
                tool_results = []
                for call in xml_calls:
                    tool_fn = TOOL_FUNCTIONS.get(call["name"])
                    if tool_fn:
                        logger.info(f"Fallback calling tool: {call['name']}")
                        try:
                            result = await tool_fn(**call["args"])
                            tool_results.append(f"Tool {call['name']}: {result}")
                        except Exception as te:
                            tool_results.append(f"Tool {call['name']} error: {te}")

                if tool_results:
                    messages.append({"role": "assistant", "content": message.content})
                    messages.append({
                        "role": "user",
                        "content": "The tool calls have been executed. Results:\n" + "\n".join(tool_results) + "\n\nPlease provide your final response to the customer based on these results.",
                    })
                    continue

        if message.content:
            logger.info(f"Final agent content: {message.content}")
            return message.content

        logger.error("Agent response had no content and no tool calls.")
        return "I apologize, I wasn't able to generate a response. Please try again."

    logger.warning(f"Agent exceeded {max_turns} turns")
    return "I've processed your request. A support ticket has been created and you'll receive assistance shortly."
