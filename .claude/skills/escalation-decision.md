# Escalation Decision Skill

## Purpose
Determine whether a customer inquiry should be handled by the AI agent or escalated to a human support representative at Tier 2 or Tier 3.

## When to Use
- After analyzing every incoming customer message
- When specific trigger criteria are detected
- When the AI agent cannot resolve an issue after 3 attempts
- When explicitly requested by the customer

## Inputs
- `message` (string): Customer's message content
- `sentiment` (object): Output from sentiment-analysis skill
- `category` (string): Ticket category
- `customer_history` (object, optional): Previous interactions
- `interaction_count` (int): Number of messages in current conversation

## Decision Matrix

### Level 1: IMMEDIATE ESCALATION → Tier 2 + Tier 3
```
IF any of:
  - Legal threat detected (trigger words)
  - Data loss or security breach claim
  - Customer mentions "production" + "down"
  → escalate_to = "tier_2_and_tier_3"
  → priority = "critical"
  → response_required_within = "1 hour"
```

### Level 2: REQUIRED ESCALATION → Tier 2
```
IF any of:
  - Billing/refund request
  - Account deletion request
  - GDPR/privacy data request
  - SSO/Enterprise configuration
  - Customer explicitly requests human
  → escalate_to = "tier_2"
  → priority = "high"  
  → response_required_within = "4 hours"
```

### Level 3: CONDITIONAL ESCALATION → Flag for Review
```
IF any of:
  - Same customer, same issue, 3rd contact
  - Sentiment score < -0.7 (very negative)
  - AI agent fails to resolve after 3 messages
  - Complex technical issue requiring investigation
  → escalate_to = "tier_2"
  → priority = "medium"
  → response_required_within = "24 hours"
```

### Level 4: NO ESCALATION → AI Agent Handles
```
IF all of:
  - How-to questions
  - Feature explanations
  - Standard troubleshooting
  - Positive feedback
  - Feature requests
  - Status inquiries
  → escalate_to = null
  → handled_by = "ai_agent"
```

## Output
```json
{
  "should_escalate": true,
  "escalation_level": 2,
  "escalate_to": "tier_2",
  "priority": "high",
  "reason": "Customer requested billing refund - requires human authorization",
  "ticket_priority": "high",
  "response_deadline": "4 hours",
  "handoff_message": "I've escalated your case to our billing team..."
}
```

## Handoff Protocol
1. Create/update the support ticket with all context
2. Flag the conversation as "escalated"
3. Include conversation history summary for the human agent
4. Send the customer an acknowledgment with:
   - Ticket number
   - Expected response time
   - What to expect next
5. Offer to continue helping with any other questions

## Notes
- Never tell the customer "I'm just an AI" — say "Let me connect you with our specialized team"
- Always create a ticket BEFORE escalating
- Include all conversation context in the escalation
- After hours (weekends/nights): Set realistic response expectations
