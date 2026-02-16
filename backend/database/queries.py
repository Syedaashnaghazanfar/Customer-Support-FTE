"""
Customer Success FTE — Database Queries
Async PostgreSQL operations using asyncpg.
"""

import os
import uuid
from datetime import datetime
from typing import Optional

import asyncpg
from dotenv import load_dotenv

load_dotenv()

# Connection pool (initialized once)
_pool: Optional[asyncpg.Pool] = None


def _serialize_row(row: dict) -> dict:
    """Convert asyncpg types (UUID, datetime) to JSON-safe Python types."""
    result = {}
    for k, v in row.items():
        if hasattr(v, 'hex') and hasattr(v, 'int'):  # UUID-like
            result[k] = str(v)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        else:
            result[k] = v
    return result


async def get_pool() -> asyncpg.Pool:
    """Get or create the database connection pool."""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            host=os.getenv("POSTGRES_HOST", "localhost"),
            port=int(os.getenv("POSTGRES_PORT", "5432")),
            database=os.getenv("POSTGRES_DB", "fte_db"),
            user=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", "postgres123"),
            min_size=2,
            max_size=10
        )
    return _pool


async def close_pool():
    """Close the database connection pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


# =============================================================================
# CUSTOMER OPERATIONS
# =============================================================================

async def find_customer_by_email(email: str) -> Optional[dict]:
    """Find a customer by email address."""
    pool = await get_pool()
    row = await pool.fetchrow(
        """
        SELECT c.* FROM customers c
        JOIN customer_identifiers ci ON c.id = ci.customer_id
        WHERE ci.identifier_type = 'email' AND LOWER(ci.identifier_value) = LOWER($1)
        """,
        email
    )
    return _serialize_row(dict(row)) if row else None


async def find_customer_by_phone(phone: str) -> Optional[dict]:
    """Find a customer by phone number."""
    pool = await get_pool()
    row = await pool.fetchrow(
        """
        SELECT c.* FROM customers c
        JOIN customer_identifiers ci ON c.id = ci.customer_id
        WHERE ci.identifier_type = 'phone' AND ci.identifier_value = $1
        """,
        phone
    )
    return _serialize_row(dict(row)) if row else None


async def create_customer(name: str, email: str = None, phone: str = None, company: str = None) -> dict:
    """Create a new customer and store their identifiers."""
    pool = await get_pool()
    customer_id = uuid.uuid4()

    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """
                INSERT INTO customers (id, name, primary_email, primary_phone, company)
                VALUES ($1, $2, $3, $4, $5)
                """,
                customer_id, name, email, phone, company
            )

            if email:
                await conn.execute(
                    """
                    INSERT INTO customer_identifiers (customer_id, identifier_type, identifier_value)
                    VALUES ($1, 'email', $2) ON CONFLICT DO NOTHING
                    """,
                    customer_id, email.lower()
                )

            if phone:
                await conn.execute(
                    """
                    INSERT INTO customer_identifiers (customer_id, identifier_type, identifier_value)
                    VALUES ($1, 'phone', $2) ON CONFLICT DO NOTHING
                    """,
                    customer_id, phone
                )

    return {"id": str(customer_id), "name": name, "email": email, "phone": phone}


async def resolve_customer(email: str = None, phone: str = None, name: str = None) -> dict:
    """Resolve a customer across channels. Creates if not found."""
    customer = None

    if email:
        customer = await find_customer_by_email(email)
    if not customer and phone:
        customer = await find_customer_by_phone(phone)

    if customer:
        return {**dict(customer), "is_new": False}

    # Create new customer
    new_customer = await create_customer(
        name=name or "Unknown Customer",
        email=email,
        phone=phone
    )
    return {**new_customer, "is_new": True}


# =============================================================================
# CONVERSATION OPERATIONS
# =============================================================================

async def create_conversation(customer_id: str, channel: str, subject: str = None) -> dict:
    """Create a new conversation."""
    pool = await get_pool()
    conv_id = uuid.uuid4()

    await pool.execute(
        """
        INSERT INTO conversations (id, customer_id, channel, subject)
        VALUES ($1, $2, $3, $4)
        """,
        conv_id, uuid.UUID(customer_id), channel, subject
    )

    return {"id": str(conv_id), "customer_id": customer_id, "channel": channel}


async def get_active_conversation(customer_id: str, channel: str) -> Optional[dict]:
    """Get the active conversation for a customer on a specific channel."""
    pool = await get_pool()
    row = await pool.fetchrow(
        """
        SELECT * FROM conversations
        WHERE customer_id = $1 AND channel = $2 AND status = 'active'
        ORDER BY started_at DESC LIMIT 1
        """,
        uuid.UUID(customer_id), channel
    )
    return _serialize_row(dict(row)) if row else None


# =============================================================================
# MESSAGE OPERATIONS
# =============================================================================

async def store_message(
    conversation_id: str,
    customer_id: str,
    channel: str,
    direction: str,
    content: str,
    sentiment_score: float = None,
    metadata: dict = None
) -> dict:
    """Store a message in the database."""
    pool = await get_pool()
    msg_id = uuid.uuid4()

    await pool.execute(
        """
        INSERT INTO messages (id, conversation_id, customer_id, channel, direction, content, sentiment_score, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        """,
        msg_id,
        uuid.UUID(conversation_id),
        uuid.UUID(customer_id),
        channel,
        direction,
        content,
        sentiment_score,
        str(metadata or {}).replace("'", '"')
    )

    # Update conversation message count
    await pool.execute(
        """
        UPDATE conversations SET message_count = message_count + 1, updated_at = NOW()
        WHERE id = $1
        """,
        uuid.UUID(conversation_id)
    )

    return {"id": str(msg_id)}


async def get_conversation_messages(conversation_id: str, limit: int = 20) -> list[dict]:
    """Get messages for a conversation."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT * FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        LIMIT $2
        """,
        uuid.UUID(conversation_id), limit
    )
    return [_serialize_row(dict(r)) for r in rows]


# =============================================================================
# TICKET OPERATIONS
# =============================================================================

async def create_ticket(
    customer_id: str,
    channel: str,
    subject: str,
    description: str,
    category: str = "general",
    priority: str = "medium",
    conversation_id: str = None
) -> dict:
    """Create a support ticket."""
    pool = await get_pool()
    ticket_id = uuid.uuid4()

    # Generate sequential ticket number
    row = await pool.fetchrow("SELECT COUNT(*) as cnt FROM tickets")
    ticket_num = f"TICKET-{(row['cnt'] + 1):04d}"

    await pool.execute(
        """
        INSERT INTO tickets (id, ticket_number, conversation_id, customer_id, channel, subject, description, category, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """,
        ticket_id,
        ticket_num,
        uuid.UUID(conversation_id) if conversation_id else None,
        uuid.UUID(customer_id),
        channel,
        subject,
        description,
        category,
        priority
    )

    return {"id": str(ticket_id), "ticket_number": ticket_num}


async def get_ticket(ticket_number: str) -> Optional[dict]:
    """Get ticket by ticket number."""
    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT * FROM tickets WHERE ticket_number = $1", ticket_number
    )
    return _serialize_row(dict(row)) if row else None


async def update_ticket_status(ticket_number: str, status: str, resolution_notes: str = None) -> bool:
    """Update ticket status."""
    pool = await get_pool()
    result = await pool.execute(
        """
        UPDATE tickets SET status = $2, resolution_notes = COALESCE($3, resolution_notes),
        updated_at = NOW(), resolved_at = CASE WHEN $2 IN ('resolved', 'closed') THEN NOW() ELSE resolved_at END
        WHERE ticket_number = $1
        """,
        ticket_number, status, resolution_notes
    )
    return "UPDATE 1" in result


async def get_customer_tickets(customer_id: str, status: str = None) -> list[dict]:
    """Get all tickets for a customer."""
    pool = await get_pool()
    query = "SELECT * FROM tickets WHERE customer_id = $1"
    params = [uuid.UUID(customer_id)]

    if status:
        query += " AND status = $2"
        params.append(status)

    query += " ORDER BY created_at DESC"
    rows = await pool.fetch(query, *params)
    return [_serialize_row(dict(r)) for r in rows]


# =============================================================================
# KNOWLEDGE BASE OPERATIONS
# =============================================================================

async def search_knowledge(query: str, limit: int = 3) -> list[dict]:
    """Search knowledge base using text matching (fallback for no embeddings)."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT title, content, category,
               ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', $1)) as rank
        FROM knowledge_base
        WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT $2
        """,
        query, limit
    )
    return [dict(r) for r in rows]


async def search_knowledge_vector(embedding: list[float], limit: int = 3) -> list[dict]:
    """Search knowledge base using vector similarity (pgvector)."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT title, content, category,
               1 - (embedding <=> $1::vector) as similarity
        FROM knowledge_base
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector
        LIMIT $2
        """,
        str(embedding), limit
    )
    return [dict(r) for r in rows]


# =============================================================================
# METRICS OPERATIONS
# =============================================================================

async def record_metric(metric_type: str, value: float, channel: str = None, metadata: dict = None):
    """Record an agent metric."""
    pool = await get_pool()
    await pool.execute(
        """
        INSERT INTO agent_metrics (metric_type, channel, value, metadata)
        VALUES ($1, $2, $3, $4::jsonb)
        """,
        metric_type, channel, value, str(metadata or {}).replace("'", '"')
    )


async def get_channel_metrics(channel: str = None, hours: int = 24) -> list[dict]:
    """Get metrics for a channel over specified hours."""
    pool = await get_pool()
    query = """
        SELECT metric_type, channel, AVG(value) as avg_value, COUNT(*) as count
        FROM agent_metrics
        WHERE recorded_at > NOW() - INTERVAL '%s hours'
    """ % hours

    if channel:
        query += f" AND channel = '{channel}'"

    query += " GROUP BY metric_type, channel ORDER BY metric_type"
    rows = await pool.fetch(query)
    return [dict(r) for r in rows]


# =============================================================================
# CUSTOMER HISTORY
# =============================================================================

async def get_customer_history(customer_id: str, limit: int = 10) -> dict:
    """Get complete customer history across all channels."""
    pool = await get_pool()

    # Get recent conversations
    conversations = await pool.fetch(
        """
        SELECT * FROM conversations WHERE customer_id = $1
        ORDER BY started_at DESC LIMIT $2
        """,
        uuid.UUID(customer_id), limit
    )

    # Get open tickets
    open_tickets = await pool.fetch(
        """
        SELECT * FROM tickets WHERE customer_id = $1 AND status IN ('open', 'in_progress', 'escalated')
        ORDER BY created_at DESC
        """,
        uuid.UUID(customer_id)
    )

    # Get all identifiers
    identifiers = await pool.fetch(
        "SELECT identifier_type, identifier_value FROM customer_identifiers WHERE customer_id = $1",
        uuid.UUID(customer_id)
    )

    return {
        "conversations": [_serialize_row(dict(c)) for c in conversations],
        "open_tickets": [_serialize_row(dict(t)) for t in open_tickets],
        "identifiers": [_serialize_row(dict(i)) for i in identifiers],
        "total_conversations": len(conversations)
    }
