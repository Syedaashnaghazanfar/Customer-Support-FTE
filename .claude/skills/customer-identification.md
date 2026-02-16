# Customer Identification Skill

## Purpose
Identify and unify customers across different communication channels (email, WhatsApp, web form) to provide seamless cross-channel support and maintain conversation context.

## When to Use
- Every incoming message to resolve the customer's identity
- When a customer contacts from a new channel
- When linking conversations across channels
- When looking up previous interaction history

## Inputs
- `channel` (string): Current channel — "email", "whatsapp", "web_form"
- `email` (string, optional): Customer email address
- `phone` (string, optional): Customer phone number
- `name` (string, optional): Customer's provided name

## Identification Flow

### Step 1: Primary Identifier Match
```
Email channel:
  → Primary: email address
  → Search: customer_identifiers WHERE type='email' AND value='{email}'

WhatsApp channel:
  → Primary: phone number
  → Search: customer_identifiers WHERE type='phone' AND value='{phone}'

Web Form channel:
  → Primary: email address (from form field)
  → Search: customer_identifiers WHERE type='email' AND value='{email}'
```

### Step 2: Cross-Channel Resolution
```
IF customer found by primary identifier:
  → Load ALL identifiers for this customer_id
  → Check for conversations on OTHER channels
  → Merge context from all channels
  
IF customer NOT found:
  → Create new customer record
  → Store primary identifier
  → Start fresh conversation
```

### Step 3: Context Loading
```
Load for identified customer:
  - All open tickets
  - Last 10 conversations (across all channels)
  - Sentiment trend
  - Preferred channel
  - Previous escalations
  - Total interaction count
```

## Output
```json
{
  "customer_id": "uuid-here",
  "is_new_customer": false,
  "customer_name": "David Smith",
  "identifiers": {
    "email": "david.smith@bigcorp.com",
    "phone": "+1234567888"
  },
  "channels_used": ["email", "web_form"],
  "open_tickets": ["TICKET-003"],
  "conversation_count": 3,
  "last_interaction": "2025-01-15T10:30:00Z",
  "last_channel": "email",
  "average_sentiment": -0.2,
  "is_repeat_issue": true,
  "notes": "Previously contacted about Gantt chart issue via web form"
}
```

## Cross-Channel Scenarios

### Scenario 1: Same Customer, Different Channel
> David first submitted a web form about Gantt chart (TICKET-003).
> David now emails about the same issue.
> → Identify as same customer via email match
> → Link to existing ticket TICKET-003
> → Reference previous conversation in response

### Scenario 2: New Channel, Known Customer
> Mike first contacted via WhatsApp about adding team members.
> Mike now uses the web form with his email.
> → Match by name if email/phone not linked
> → Prompt: "Are you Mike Chen who contacted us on WhatsApp?"
> → If confirmed, link identifiers

### Scenario 3: Completely New Customer
> First-time contact from unknown email/phone.
> → Create new customer record
> → Store all available identifiers
> → No prior context to load

## Database Tables Used
- `customers` — Core customer record
- `customer_identifiers` — Email/phone/name mappings
- `conversations` — Conversation history per channel
- `messages` — Individual messages
- `tickets` — Support tickets linked to customer

## Notes
- Phone numbers should be normalized to E.164 format (+1234567890)
- Email addresses should be lowercased for matching
- Name matching is fuzzy — use as secondary identifier only
- Always prioritize email/phone over name for identification
- GDPR: Only store identifiers that the customer has provided
