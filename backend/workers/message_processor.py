"""
Customer Success FTE — Unified Message Processor Worker
Consumes messages from Kafka, processes them through the AI agent,
and sends responses back via the appropriate channel.
"""

import asyncio
import json
import logging
import os
from datetime import datetime

from agent.groq_runner import run_agent
from agent.prompts import get_system_prompt
from agent.formatters import format_response, split_whatsapp_message
from channels.gmail_handler import gmail_handler
from channels.whatsapp_handler import whatsapp_handler
from database.queries import (
    create_conversation,
    create_ticket,
    get_active_conversation,
    record_metric,
    resolve_customer,
    store_message,
)
from kafka_client import kafka_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MessageProcessor:
    """Unified processor: Kafka consumer → Customer resolution → Agent → Response → Metrics."""

    def __init__(self):
        self.running = False

    async def process_message(self, channel: str, message_data: dict) -> dict:
        """
        Process a single inbound message through the full pipeline.
        
        Pipeline:
        1. Resolve customer identity
        2. Get/create conversation
        3. Store inbound message
        4. Run AI agent
        5. Format response for channel
        6. Send via channel handler
        7. Store outbound message
        8. Record metrics
        """
        start_time = datetime.now()

        try:
            # 1. Resolve customer
            customer = await resolve_customer(
                email=message_data.get("email") or message_data.get("from_email"),
                phone=message_data.get("phone") or message_data.get("from_phone"),
                name=message_data.get("name") or message_data.get("profile_name", "Customer"),
            )
            customer_id = customer["id"]
            customer_name = customer.get("name", "Customer")

            logger.info(f"Processing message from {customer_name} via {channel}")

            # 2. Get or create conversation
            conversation = await get_active_conversation(customer_id, channel)
            if not conversation:
                conversation = await create_conversation(
                    customer_id=customer_id,
                    channel=channel,
                    subject=message_data.get("subject", "Support Request"),
                )

            conversation_id = str(conversation["id"])

            # 3. Store inbound message
            content = message_data.get("body") or message_data.get("message", "")
            await store_message(
                conversation_id=conversation_id,
                customer_id=customer_id,
                channel=channel,
                direction="inbound",
                content=content,
            )

            # 4. Run AI agent (direct Groq chat completions, not openai-agents SDK)
            system_prompt = get_system_prompt(channel)
            
            # Build context for the agent
            agent_input = f"""
Customer: {customer_name}
Email: {message_data.get("email") or message_data.get("from_email", "unknown")}
Channel: {channel}
Subject: {message_data.get("subject", "N/A")}

Message:
{content}
"""
            logger.info(f"Running agent for {customer_name}...")
            agent_response = await run_agent(system_prompt, agent_input)
            logger.info(f"Agent raw response: {agent_response}")

            # 5. Format response for channel
            formatted = format_response(agent_response, channel, customer_name)
            logger.info(f"Formatted response: {formatted}")

            # 6. Send via channel handler
            delivery_result = await self._deliver_response(
                channel=channel,
                formatted_response=formatted,
                message_data=message_data,
            )

            # 7. Store outbound message
            await store_message(
                conversation_id=conversation_id,
                customer_id=customer_id,
                channel=channel,
                direction="outbound",
                content=formatted,
            )

            # 8. Record metrics
            processing_time = (datetime.now() - start_time).total_seconds()
            await record_metric("processing_time", processing_time, channel)
            await record_metric("message_processed", 1.0, channel)

            # Publish outbound event to Kafka
            try:
                await kafka_client.publish_outbound(channel, {
                    "customer_id": customer_id,
                    "conversation_id": conversation_id,
                    "response": formatted[:200],  # Preview only
                })
            except Exception as e:
                logger.warning(f"Kafka publish failed: {e}")

            logger.info(f"Processed message in {processing_time:.2f}s for {customer_name} via {channel}")

            return {
                "success": True,
                "customer_id": customer_id,
                "conversation_id": conversation_id,
                "response": formatted,
                "processing_time": processing_time,
                "delivery": delivery_result,
            }

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            await record_metric("processing_error", 1.0, channel)
            return {"success": False, "error": str(e)}

    async def _deliver_response(
        self,
        channel: str,
        formatted_response: str,
        message_data: dict,
    ) -> dict:
        """Deliver the formatted response via the appropriate channel handler."""
        try:
            if channel == "email":
                return await gmail_handler.send_reply(
                    to_email=message_data.get("from_email", ""),
                    subject=message_data.get("subject", "Support Response"),
                    body=formatted_response,
                    thread_id=message_data.get("thread_id"),
                )
            elif channel == "whatsapp":
                messages = split_whatsapp_message(formatted_response)
                return await whatsapp_handler.send_split_messages(
                    to_phone=message_data.get("from_phone", ""),
                    messages=messages,
                )
            elif channel == "web_form":
                # Web form responses are returned via API, not pushed
                return {"success": True, "method": "api_response"}
            else:
                return {"success": False, "error": f"Unknown channel: {channel}"}
        except Exception as e:
            logger.error(f"Delivery failed for {channel}: {e}")
            return {"success": False, "error": str(e)}

    async def start_kafka_consumer(self):
        """Start consuming messages from Kafka inbound topic."""
        self.running = True
        consumer = await kafka_client.create_consumer("inbound", group_id="fte-message-processor")

        logger.info("Message processor started — consuming from Kafka inbound topic...")

        try:
            async for msg in consumer:
                if not self.running:
                    break

                try:
                    event = msg.value
                    channel = event.get("channel", "web_form")
                    data = event.get("data", {})

                    await self.process_message(channel, data)
                except Exception as e:
                    logger.error(f"Error processing Kafka message: {e}")

        finally:
            await kafka_client.stop_all()

    async def stop(self):
        """Stop the message processor."""
        self.running = False


# Singleton instance
message_processor = MessageProcessor()


if __name__ == "__main__":
    asyncio.run(message_processor.start_kafka_consumer())
