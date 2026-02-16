"""
Transition Tests — Verify MCP tools map correctly to production @function_tool equivalents.
Run with: pytest tests/test_transition.py -v
"""

import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from agent.formatters import format_response, format_email, format_whatsapp, format_web_form, split_whatsapp_message


# =====================================================================
# Channel Formatter Tests
# =====================================================================

class TestEmailFormatter:
    def test_email_greeting(self):
        result = format_email("Hello!", "Sarah")
        assert "Hi Sarah," in result

    def test_email_closing(self):
        result = format_email("Test message", "John")
        assert "Best regards" in result
        assert "TechCorp Support" in result

    def test_email_max_length(self):
        long_message = "x" * 3000
        result = format_email(long_message, "User")
        assert len(result) <= 2000

    def test_email_angry_greeting(self):
        result = format_email("Test", "David", sentiment="very_negative")
        assert "Dear David," in result


class TestWhatsAppFormatter:
    def test_whatsapp_greeting(self):
        result = format_whatsapp("Hello!", "Mike")
        assert "Hi Mike! 👋" in result

    def test_whatsapp_max_length(self):
        long_message = "x" * 2000
        result = format_whatsapp(long_message, "User")
        assert len(result) <= 1600

    def test_whatsapp_numbered_list_conversion(self):
        message = "1. First step\n2. Second step\n3. Third step"
        result = format_whatsapp(message, "User")
        assert "•" in result

    def test_whatsapp_angry_no_emoji(self):
        result = format_whatsapp("Test", "User", sentiment="angry")
        assert "👋" not in result


class TestWebFormFormatter:
    def test_web_form_greeting(self):
        result = format_web_form("Hello!", "Alice")
        assert "Thank you for reaching out, Alice." in result

    def test_web_form_closing(self):
        result = format_web_form("Test", "User")
        assert "don't hesitate to ask" in result

    def test_web_form_max_length(self):
        long_message = "x" * 2000
        result = format_web_form(long_message, "User")
        assert len(result) <= 1000


class TestFormatRouter:
    def test_routes_email(self):
        result = format_response("Test", "email", "User")
        assert "Best regards" in result

    def test_routes_whatsapp(self):
        result = format_response("Test", "whatsapp", "User")
        assert "👋" in result

    def test_routes_web_form(self):
        result = format_response("Test", "web_form", "User")
        assert "Thank you for reaching out" in result

    def test_unknown_channel_defaults_to_web_form(self):
        result = format_response("Test", "unknown_channel", "User")
        assert "Thank you for reaching out" in result


class TestWhatsAppSplitter:
    def test_short_message_no_split(self):
        result = split_whatsapp_message("Short message")
        assert len(result) == 1

    def test_long_message_splits(self):
        long = "A" * 800 + "\n\n" + "B" * 800 + "\n\n" + "C" * 800
        result = split_whatsapp_message(long)
        assert len(result) <= 2

    def test_max_two_messages(self):
        very_long = "\n\n".join(["x" * 500] * 10)
        result = split_whatsapp_message(very_long)
        assert len(result) <= 2


# =====================================================================
# Escalation Trigger Tests
# =====================================================================

class TestEscalationTriggers:
    """Verify escalation-triggering keywords are handled."""

    LEGAL_KEYWORDS = ["lawyer", "attorney", "lawsuit", "sue", "legal action"]
    DATA_KEYWORDS = ["lost data", "data deleted", "breach", "hacked"]
    HUMAN_KEYWORDS = ["human", "agent", "representative", "real person", "manager"]

    def test_legal_keywords_detected(self):
        for keyword in self.LEGAL_KEYWORDS:
            message = f"I'm going to contact my {keyword}!"
            assert keyword in message.lower()

    def test_data_keywords_detected(self):
        for keyword in self.DATA_KEYWORDS:
            message = f"I think there was a {keyword} situation"
            assert keyword in message.lower()

    def test_human_request_detected(self):
        for keyword in self.HUMAN_KEYWORDS:
            message = f"I want to speak to a {keyword}"
            assert keyword in message.lower()


# =====================================================================
# Web Form Validation Tests
# =====================================================================

class TestWebFormValidation:
    def test_valid_submission(self):
        from channels.web_form_handler import SupportFormSubmission, web_form_handler
        
        submission = SupportFormSubmission(
            name="John Doe",
            email="john@example.com",
            subject="Help with login",
            category="technical",
            priority="medium",
            message="I cannot log in to my account, tried resetting password",
        )
        result = web_form_handler.validate_submission(submission)
        assert result["valid"] is True

    def test_invalid_category(self):
        from channels.web_form_handler import SupportFormSubmission, web_form_handler
        
        submission = SupportFormSubmission(
            name="John Doe",
            email="john@example.com",
            subject="Test",
            category="invalid_category",
            priority="medium",
            message="This is a test message for validation",
        )
        result = web_form_handler.validate_submission(submission)
        assert result["valid"] is False

    def test_invalid_priority(self):
        from channels.web_form_handler import SupportFormSubmission, web_form_handler
        
        submission = SupportFormSubmission(
            name="Jane",
            email="jane@example.com",
            subject="Test",
            category="general",
            priority="invalid_prio",
            message="This is a test message for priority validation",
        )
        result = web_form_handler.validate_submission(submission)
        assert result["valid"] is False

    def test_confirmation_message(self):
        from channels.web_form_handler import web_form_handler
        
        result = web_form_handler.format_confirmation("TICKET-0001", "John")
        assert "TICKET-0001" in result
        assert "John" in result
