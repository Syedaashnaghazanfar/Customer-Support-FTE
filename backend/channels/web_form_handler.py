"""
Customer Success FTE — Web Form Channel Handler
Processes web form submissions via FastAPI.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# =============================================================================
# Request/Response Models
# =============================================================================

class SupportFormSubmission(BaseModel):
    """Incoming web form submission."""
    name: str = Field(min_length=1, max_length=255, description="Customer's full name")
    email: EmailStr = Field(description="Customer's email address")
    subject: str = Field(min_length=1, max_length=500, description="Issue subject")
    category: str = Field(default="general", description="Issue category")
    priority: str = Field(default="medium", description="Priority level")
    message: str = Field(min_length=10, max_length=5000, description="Issue description")


class SupportFormResponse(BaseModel):
    """Response to web form submission."""
    success: bool
    ticket_number: Optional[str] = None
    message: str
    estimated_response_time: Optional[str] = None


class TicketStatusResponse(BaseModel):
    """Ticket status lookup response."""
    ticket_number: str
    status: str
    subject: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    resolution_notes: Optional[str] = None
    messages: list[dict] = []


class WebFormHandler:
    """Handles web form submissions and ticket lookups."""

    def validate_submission(self, submission: SupportFormSubmission) -> dict:
        """Validate and sanitize a form submission."""
        errors = []

        # Validate category
        valid_categories = ["general", "technical", "billing", "bug_report", "feedback"]
        if submission.category not in valid_categories:
            errors.append(f"Invalid category. Must be one of: {', '.join(valid_categories)}")

        # Validate priority
        valid_priorities = ["low", "medium", "high", "critical"]
        if submission.priority not in valid_priorities:
            errors.append(f"Invalid priority. Must be one of: {', '.join(valid_priorities)}")

        if errors:
            return {"valid": False, "errors": errors}

        return {
            "valid": True,
            "sanitized": {
                "name": submission.name.strip(),
                "email": submission.email.strip().lower(),
                "subject": submission.subject.strip(),
                "category": submission.category,
                "priority": submission.priority,
                "message": submission.message.strip(),
                "channel": "web_form",
                "submitted_at": datetime.now().isoformat(),
            }
        }

    def format_confirmation(self, ticket_number: str, customer_name: str) -> str:
        """Format a confirmation response for web form submission."""
        return (
            f"Thank you for reaching out, {customer_name}. "
            f"We've received your request and created ticket {ticket_number}. "
            f"Our team will review your message and respond as soon as possible. "
            f"You can check the status of your ticket anytime using your ticket number."
        )


# Singleton instance 
web_form_handler = WebFormHandler()
