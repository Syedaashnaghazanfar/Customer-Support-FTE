"""
Customer Success FTE — Main Agent
Production agent using OpenAI Agents SDK with Groq as the LLM provider.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Disable OpenAI tracing — we use Groq, not OpenAI, so traces would fail.
os.environ.setdefault("OPENAI_AGENTS_DISABLE_TRACING", "1")

from agents import Agent

from agent.prompts import get_system_prompt
from agent.tools import (
    create_ticket,
    escalate_to_human,
    get_customer_history,
    search_knowledge_base,
    send_response,
)

# =============================================================================
# Groq Configuration
# =============================================================================
# The OpenAI Agents SDK reads OPENAI_API_KEY and OPENAI_BASE_URL from env.
# We set these to Groq's values in .env:
#   OPENAI_API_KEY=your_groq_api_key
#   OPENAI_BASE_URL=https://api.groq.com/openai/v1
# =============================================================================


def create_agent(channel: str = "web_form") -> Agent:
    """
    Create a Customer Success agent configured for a specific channel.
    
    Args:
        channel: The communication channel — "email", "whatsapp", or "web_form"
    
    Returns:
        Configured Agent instance ready to process messages
    """
    return Agent(
        name="Customer Success FTE",
        # llama-3.3-70b-versatile works with flat tool params on Groq.
        model=os.getenv("AGENT_MODEL", "llama-3.3-70b-versatile"),
        instructions=get_system_prompt(channel),
        tools=[
            search_knowledge_base,
            create_ticket,
            get_customer_history,
            escalate_to_human,
            send_response,
        ],
    )


# Pre-configured agents per channel
email_agent = create_agent("email")
whatsapp_agent = create_agent("whatsapp")
web_form_agent = create_agent("web_form")


def get_agent(channel: str) -> Agent:
    """Get the pre-configured agent for a specific channel."""
    agents = {
        "email": email_agent,
        "whatsapp": whatsapp_agent,
        "web_form": web_form_agent,
    }
    return agents.get(channel, web_form_agent)
