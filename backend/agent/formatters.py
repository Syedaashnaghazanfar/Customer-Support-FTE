"""
Customer Success FTE — Channel Formatters
Format AI responses according to channel conventions.
"""


def format_email(message: str, customer_name: str, sentiment: str = "neutral") -> str:
    """Format response for email channel."""
    greeting = f"Hi {customer_name},"
    
    if sentiment in ("angry", "very_negative", "hostile"):
        greeting = f"Dear {customer_name},"

    closing = "\n\nBest regards,\nTechCorp Support Team\nsupport@techcorp.io"

    formatted = f"{greeting}\n\n{message}{closing}"
    return formatted[:2000]


def format_whatsapp(message: str, customer_name: str, sentiment: str = "neutral") -> str:
    """Format response for WhatsApp channel."""
    greeting = f"Hi {customer_name}! 👋"
    
    if sentiment in ("angry", "very_negative", "hostile"):
        greeting = f"Hi {customer_name},"

    # Replace numbered lists with bullet points
    lines = message.split("\n")
    formatted_lines = []
    for line in lines:
        stripped = line.strip()
        # Convert "1. " style to "• " style
        if stripped and stripped[0].isdigit() and ". " in stripped:
            idx = stripped.index(". ")
            formatted_lines.append("• " + stripped[idx + 2:])
        else:
            formatted_lines.append(stripped)

    body = "\n".join(formatted_lines)
    formatted = f"{greeting}\n\n{body}"

    # Enforce length limit
    if len(formatted) > 1600:
        formatted = formatted[:1570] + "\n\n(continued in next message)"

    return formatted


def format_web_form(message: str, customer_name: str, sentiment: str = "neutral") -> str:
    """Format response for web form channel."""
    greeting = f"Thank you for reaching out, {customer_name}."
    
    if sentiment in ("angry", "very_negative", "hostile"):
        greeting = f"Thank you for bringing this to our attention, {customer_name}. We take your concern seriously."

    closing = "\n\nIf you need further assistance, please don't hesitate to ask."
    formatted = f"{greeting}\n\n{message}{closing}"
    return formatted[:1000]


def format_response(message: str, channel: str, customer_name: str, sentiment: str = "neutral") -> str:
    """Route to the appropriate formatter based on channel."""
    formatters = {
        "email": format_email,
        "whatsapp": format_whatsapp,
        "web_form": format_web_form,
    }
    
    formatter = formatters.get(channel, format_web_form)
    return formatter(message, customer_name, sentiment)


def split_whatsapp_message(message: str, max_length: int = 1600) -> list[str]:
    """Split a long message into multiple WhatsApp-sized chunks."""
    if len(message) <= max_length:
        return [message]

    messages = []
    current = ""
    
    for paragraph in message.split("\n\n"):
        if len(current) + len(paragraph) + 2 > max_length:
            if current:
                messages.append(current.strip())
            current = paragraph
        else:
            current += ("\n\n" if current else "") + paragraph

    if current:
        messages.append(current.strip())

    return messages[:2]  # Max 2 messages for WhatsApp
