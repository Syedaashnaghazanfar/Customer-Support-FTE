"""
Customer Success FTE — Kafka Client
Producer and Consumer for event streaming across channels.
"""

import asyncio
import json
import os
from typing import Callable, Optional

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

# Topic definitions
TOPICS = {
    "inbound": "fte.messages.inbound",       # All incoming messages
    "outbound": "fte.messages.outbound",      # All outgoing responses
    "tickets": "fte.tickets.events",          # Ticket CRUD events
    "escalations": "fte.escalations",         # Escalation events
    "metrics": "fte.metrics",                 # Agent metrics
}


class KafkaClient:
    """Kafka producer and consumer for event-driven processing."""

    def __init__(self):
        self.bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        self.producer: Optional[AIOKafkaProducer] = None
        self.consumers: dict[str, AIOKafkaConsumer] = {}

    async def start_producer(self):
        """Initialize and start the Kafka producer."""
        self.producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
        )
        await self.producer.start()

    async def stop_producer(self):
        """Stop the Kafka producer."""
        if self.producer:
            await self.producer.stop()

    async def publish(self, topic: str, message: dict, key: str = None):
        """Publish a message to a Kafka topic."""
        if not self.producer:
            raise Exception("Kafka producer not available")

        topic_name = TOPICS.get(topic, topic)
        await asyncio.wait_for(
            self.producer.send_and_wait(topic_name, value=message, key=key),
            timeout=5.0  # 5 second timeout to prevent blocking
        )

    async def publish_inbound(self, channel: str, message: dict):
        """Publish an inbound message event."""
        await self.publish("inbound", {
            "event": "message.received",
            "channel": channel,
            "data": message,
        }, key=channel)

    async def publish_outbound(self, channel: str, message: dict):
        """Publish an outbound response event."""
        await self.publish("outbound", {
            "event": "response.sent",
            "channel": channel,
            "data": message,
        }, key=channel)

    async def publish_ticket_event(self, event_type: str, ticket_data: dict):
        """Publish a ticket event (created, updated, escalated, resolved)."""
        await self.publish("tickets", {
            "event": f"ticket.{event_type}",
            "data": ticket_data,
        }, key=ticket_data.get("ticket_number"))

    async def publish_escalation(self, ticket_id: str, reason: str, urgency: str):
        """Publish an escalation event."""
        await self.publish("escalations", {
            "event": "escalation.created",
            "ticket_id": ticket_id,
            "reason": reason,
            "urgency": urgency,
        }, key=ticket_id)

    async def publish_metric(self, metric_type: str, value: float, channel: str = None):
        """Publish a metric event."""
        await self.publish("metrics", {
            "event": "metric.recorded",
            "metric_type": metric_type,
            "value": value,
            "channel": channel,
        })

    async def create_consumer(
        self,
        topic: str,
        group_id: str = "fte-workers",
    ) -> AIOKafkaConsumer:
        """Create a Kafka consumer for a topic."""
        topic_name = TOPICS.get(topic, topic)
        consumer = AIOKafkaConsumer(
            topic_name,
            bootstrap_servers=self.bootstrap_servers,
            group_id=group_id,
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            auto_offset_reset="latest",
        )
        await consumer.start()
        self.consumers[topic] = consumer
        return consumer

    async def stop_all(self):
        """Stop all producers and consumers."""
        await self.stop_producer()
        for consumer in self.consumers.values():
            await consumer.stop()
        self.consumers.clear()


# Singleton instance
kafka_client = KafkaClient()
