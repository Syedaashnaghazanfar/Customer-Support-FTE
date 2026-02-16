"""
Customer Success FTE — Gmail Channel Handler
Handles inbound emails via Gmail API + Pub/Sub push notifications
and sends outbound replies via Gmail API.
"""

import base64
import json
import os
from email.mime.text import MIMEText
from typing import Optional

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Gmail API scopes
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
]


class GmailHandler:
    """Handles Gmail API operations for the email channel."""

    def __init__(self):
        self.service = None
        self.credentials_path = os.getenv("GMAIL_CREDENTIALS_PATH", "./credentials/gmail_credentials.json")
        self.token_path = os.getenv("GMAIL_TOKEN_PATH", "./credentials/gmail_token.json")

    async def initialize(self):
        """Initialize Gmail API service with OAuth2 credentials."""
        creds = None

        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_path):
                    raise FileNotFoundError(
                        f"Gmail credentials not found at {self.credentials_path}. "
                        "Please download from Google Cloud Console."
                    )
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES
                )
                creds = flow.run_local_server(port=0)

            # Save token for future use
            os.makedirs(os.path.dirname(self.token_path), exist_ok=True)
            with open(self.token_path, "w") as token:
                token.write(creds.to_json())

        self.service = build("gmail", "v1", credentials=creds)

    def parse_incoming_email(self, message_data: dict) -> dict:
        """Parse a Gmail API message into a structured format."""
        headers = message_data.get("payload", {}).get("headers", [])

        header_dict = {}
        for h in headers:
            header_dict[h["name"].lower()] = h["value"]

        # Extract body
        body = ""
        payload = message_data.get("payload", {})

        if "body" in payload and payload["body"].get("data"):
            body = base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8")
        elif "parts" in payload:
            for part in payload["parts"]:
                if part.get("mimeType") == "text/plain" and part.get("body", {}).get("data"):
                    body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")
                    break

        return {
            "message_id": message_data.get("id"),
            "thread_id": message_data.get("threadId"),
            "from_email": header_dict.get("from", ""),
            "to_email": header_dict.get("to", ""),
            "subject": header_dict.get("subject", ""),
            "body": body.strip()[:500],  # Truncate to 500 chars to avoid token limits
            "date": header_dict.get("date", ""),
            "channel": "email",
        }

    async def get_unread_messages(self, max_results: int = 10) -> list[dict]:
        """Fetch unread messages from inbox."""
        if not self.service:
            await self.initialize()

        results = self.service.users().messages().list(
            userId="me",
            labelIds=["INBOX", "UNREAD"],
            maxResults=max_results
        ).execute()

        messages = results.get("messages", [])
        parsed = []

        for msg_ref in messages:
            msg = self.service.users().messages().get(
                userId="me", id=msg_ref["id"], format="full"
            ).execute()
            parsed.append(self.parse_incoming_email(msg))

        return parsed

    async def send_reply(
        self,
        to_email: str,
        subject: str,
        body: str,
        thread_id: Optional[str] = None,
        in_reply_to: Optional[str] = None
    ) -> dict:
        """Send an email reply."""
        if not self.service:
            await self.initialize()

        message = MIMEText(body)
        message["to"] = to_email
        message["subject"] = f"Re: {subject}" if not subject.startswith("Re:") else subject

        if in_reply_to:
            message["In-Reply-To"] = in_reply_to
            message["References"] = in_reply_to

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")

        send_body = {"raw": raw}
        if thread_id:
            send_body["threadId"] = thread_id

        result = self.service.users().messages().send(
            userId="me", body=send_body
        ).execute()

        return {
            "success": True,
            "message_id": result.get("id"),
            "thread_id": result.get("threadId"),
        }

    async def mark_as_read(self, message_id: str):
        """Mark a message as read."""
        if not self.service:
            await self.initialize()

        self.service.users().messages().modify(
            userId="me",
            id=message_id,
            body={"removeLabelIds": ["UNREAD"]}
        ).execute()

    async def process_pubsub_notification(self, notification_data: dict) -> Optional[dict]:
        """Process a Pub/Sub push notification from Gmail."""
        if "message" in notification_data:
            pubsub_message = notification_data["message"]
            if "data" in pubsub_message:
                decoded = base64.urlsafe_b64decode(pubsub_message["data"]).decode("utf-8")
                data = json.loads(decoded)

                email_address = data.get("emailAddress")
                history_id = data.get("historyId")

                # Fetch the latest message
                messages = await self.get_unread_messages(max_results=1)
                if messages:
                    return messages[0]

        return None


# Singleton instance
gmail_handler = GmailHandler()
