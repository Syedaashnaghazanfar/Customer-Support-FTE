# Discovery Log

## Date: 2025-01-15

## Key Requirements Discovered

### Channel Requirements
- **Email (Gmail API):** Must handle inbound via Pub/Sub push notifications, outbound via Gmail send. Rate limit: 100 emails/day.
- **WhatsApp (Twilio):** Sandbox mode for development. Webhook for inbound, Twilio API for outbound. Max 1600 chars per message.
- **Web Form (FastAPI):** Direct POST endpoint. Required deliverable — 10 points. Must include form validation.

### Agent Capabilities
- 5 core tools: search_knowledge_base, create_ticket, get_customer_history, escalate_to_human, send_response
- Must create ticket at START of every conversation
- Must maintain cross-channel customer identity
- Must format responses differently per channel

### Escalation Triggers
- Legal threats → CRITICAL, immediate escalation
- Billing/refunds → HIGH, required escalation
- Explicit "human" request → escalate immediately
- Sentiment < -0.7 → flag for review
- 3+ same-issue contacts → auto-escalate

### Database as CRM
- PostgreSQL IS the CRM — no external CRM needed
- pgvector for semantic knowledge search
- 8 tables: customers, identifiers, conversations, messages, tickets, knowledge_base, channel_configs, agent_metrics

### Frontend
- Next.js with TypeScript + Tailwind
- Required: Support Form page (/support)
- Bonus: Ticket status page, Dashboard

### Scoring Highlights
- Web form component: 10 points
- Cross-channel continuity: highest rubric weight
- 24-hour stress test: proves 24/7 readiness
