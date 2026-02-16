"""
End-to-End Multichannel Tests
Run with: pytest tests/test_multichannel_e2e.py -v
"""

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport

# We test against the FastAPI app directly using httpx
pytestmark = pytest.mark.asyncio


def _make_mock_pool():
    """Create a mock pool that properly supports acquire() and fetchrow/fetch/execute."""
    mock_pool = MagicMock()

    # Mock async context manager for acquire()
    mock_conn = AsyncMock()
    mock_conn.execute = AsyncMock(return_value="INSERT 0 1")
    mock_conn.transaction = MagicMock()
    mock_conn.transaction.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_conn.transaction.return_value.__aexit__ = AsyncMock(return_value=False)

    mock_acquire = MagicMock()
    mock_acquire.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_acquire.__aexit__ = AsyncMock(return_value=False)
    mock_pool.acquire.return_value = mock_acquire

    # Direct pool operations
    mock_pool.fetchrow = AsyncMock(return_value=None)
    mock_pool.fetch = AsyncMock(return_value=[])
    mock_pool.execute = AsyncMock(return_value="INSERT 0 1")

    return mock_pool


@pytest_asyncio.fixture
async def client():
    """Create httpx async client for FastAPI app."""
    mock_pool = _make_mock_pool()

    with patch("database.queries.get_pool", new_callable=AsyncMock, return_value=mock_pool), \
         patch("database.queries._pool", mock_pool), \
         patch("kafka_client.kafka_client") as mock_kafka:

        mock_kafka.start_producer = AsyncMock()
        mock_kafka.stop_all = AsyncMock()
        mock_kafka.publish_inbound = AsyncMock()

        from api.main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac


class TestHealthEndpoint:
    async def test_health_check(self, client: AsyncClient):
        """Health endpoint should return 200 with status."""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "customer-success-fte"
        assert "timestamp" in data


class TestWebFormSubmission:
    async def test_submit_valid_form(self, client: AsyncClient):
        """Valid form submission should return success."""
        # Patch at api.main where the functions are imported
        with patch("api.main.message_processor") as mock_mp, \
             patch("api.main.resolve_customer") as mock_resolve, \
             patch("api.main.get_customer_tickets") as mock_tickets:

            mock_mp.process_message = AsyncMock(return_value={
                "success": True,
                "response": "Thank you for reaching out! We've created ticket TICKET-0001."
            })
            mock_resolve.return_value = {"id": "test-uuid", "is_new": False}
            mock_tickets.return_value = [{"ticket_number": "TICKET-0001"}]

            response = await client.post("/support/submit", json={
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Cannot login",
                "category": "technical",
                "priority": "high",
                "message": "I am unable to log in to my account after password reset.",
            })

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["ticket_number"] is not None

    async def test_submit_invalid_email(self, client: AsyncClient):
        """Invalid email should return 422 validation error."""
        response = await client.post("/support/submit", json={
            "name": "John",
            "email": "not-an-email",
            "subject": "Test",
            "category": "general",
            "priority": "medium",
            "message": "This is a test message that is long enough",
        })
        assert response.status_code == 422

    async def test_submit_missing_fields(self, client: AsyncClient):
        """Missing required fields should return 422."""
        response = await client.post("/support/submit", json={
            "name": "John",
        })
        assert response.status_code == 422


class TestTicketStatus:
    async def test_ticket_found(self, client: AsyncClient):
        """Valid ticket number should return ticket details."""
        from datetime import datetime

        # Patch at the import site in api.main
        with patch("api.main.get_ticket") as mock_get:
            mock_get.return_value = {
                "ticket_number": "TICKET-0001",
                "status": "open",
                "subject": "Login issue",
                "category": "technical",
                "priority": "high",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "resolution_notes": None,
            }

            response = await client.get("/support/ticket/TICKET-0001")
            assert response.status_code == 200
            data = response.json()
            assert data["ticket_number"] == "TICKET-0001"
            assert data["status"] == "open"

    async def test_ticket_not_found(self, client: AsyncClient):
        """Non-existent ticket should return 404."""
        with patch("api.main.get_ticket") as mock_get:
            mock_get.return_value = None

            response = await client.get("/support/ticket/TICKET-9999")
            assert response.status_code == 404


class TestWhatsAppWebhook:
    async def test_whatsapp_webhook_empty(self, client: AsyncClient):
        """WhatsApp webhook with no body should respond with TwiML."""
        with patch("api.main.whatsapp_handler") as mock_wa:
            mock_wa.parse_incoming_message.return_value = {"body": ""}

            response = await client.post(
                "/webhooks/whatsapp",
                data={"Body": "", "From": "whatsapp:+1234567890"},
            )
            # Should return TwiML response regardless
            assert response.status_code == 200


class TestMetrics:
    async def test_channel_metrics(self, client: AsyncClient):
        """Metrics endpoint should return channel data."""
        with patch("api.main.get_channel_metrics") as mock_metrics:
            mock_metrics.return_value = [
                {"metric_type": "message_processed", "channel": "email", "avg_value": 1.0, "count": 10},
                {"metric_type": "message_processed", "channel": "whatsapp", "avg_value": 1.0, "count": 5},
            ]

            response = await client.get("/metrics/channels?hours=24")
            assert response.status_code == 200
            data = response.json()
            assert "metrics" in data
            assert "summary" in data


class TestCrossChannelContinuity:
    """Test that the same customer is recognized across channels."""

    async def test_customer_lookup(self, client: AsyncClient):
        """Customer lookup should return history."""
        with patch("api.main.resolve_customer") as mock_resolve, \
             patch("api.main.get_customer_history") as mock_history:

            mock_resolve.return_value = {"id": "uuid-123", "name": "David", "is_new": False}
            mock_history.return_value = {
                "conversations": [],
                "open_tickets": [],
                "identifiers": [
                    {"identifier_type": "email", "identifier_value": "david@corp.com"},
                    {"identifier_type": "phone", "identifier_value": "+1234567890"},
                ],
            }

            response = await client.post("/customers/lookup", json={
                "email": "david@corp.com"
            })
            assert response.status_code == 200
            data = response.json()
            assert data["customer"]["id"] == "uuid-123"
