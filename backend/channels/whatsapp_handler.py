"""
Customer Success FTE — WhatsApp Channel Handler
Handles WhatsApp messaging via Twilio API.
Sandbox mode for development, production-ready structure.
"""

import os
from typing import Optional

from twilio.rest import Client
from twilio.request_validator import RequestValidator


class WhatsAppHandler:
    """Handles Twilio WhatsApp operations."""

    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.whatsapp_number = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
        self.client = None
        self.validator = None

    def initialize(self):
        """Initialize Twilio client."""
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
            self.validator = RequestValidator(self.auth_token)

    def validate_webhook(self, url: str, params: dict, signature: str) -> bool:
        """Validate incoming Twilio webhook request."""
        if not self.validator:
            self.initialize()
        if self.validator:
            return self.validator.validate(url, params, signature)
        return False

    def parse_incoming_message(self, webhook_data: dict) -> dict:
        """Parse Twilio webhook payload into structured format."""
        # Extract sender info
        from_number = webhook_data.get("From", "").replace("whatsapp:", "")
        to_number = webhook_data.get("To", "").replace("whatsapp:", "")

        return {
            "message_sid": webhook_data.get("MessageSid", ""),
            "from_phone": from_number,
            "to_phone": to_number,
            "body": webhook_data.get("Body", ""),
            "num_media": int(webhook_data.get("NumMedia", 0)),
            "profile_name": webhook_data.get("ProfileName", ""),
            "channel": "whatsapp",
        }

    async def send_message(
        self,
        to_phone: str,
        body: str,
        media_url: Optional[str] = None
    ) -> dict:
        """Send a WhatsApp message via Twilio."""
        if not self.client:
            self.initialize()

        if not self.client:
            return {"success": False, "error": "Twilio client not configured"}

        # Enforce 1600 char limit
        if len(body) > 1600:
            body = body[:1570] + "\n\n(Message truncated)"

        # Format phone number for WhatsApp
        to_whatsapp = f"whatsapp:{to_phone}" if not to_phone.startswith("whatsapp:") else to_phone

        try:
            kwargs = {
                "from_": self.whatsapp_number,
                "body": body,
                "to": to_whatsapp,
            }

            if media_url:
                kwargs["media_url"] = [media_url]

            message = self.client.messages.create(**kwargs)

            return {
                "success": True,
                "message_sid": message.sid,
                "status": message.status,
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def send_split_messages(self, to_phone: str, messages: list[str]) -> list[dict]:
        """Send multiple WhatsApp messages (for long responses)."""
        results = []
        for msg in messages[:2]:  # Max 2 messages
            result = await self.send_message(to_phone, msg)
            results.append(result)
        return results


# Singleton instance
whatsapp_handler = WhatsAppHandler()
