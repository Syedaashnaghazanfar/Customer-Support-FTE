# Channel Adaptation Skill

## Purpose
Format AI-generated responses to match the conventions, tone, and limitations of each communication channel (Email, WhatsApp, Web Form).

## When to Use
- Every time the AI agent generates a response to send to a customer
- After the agent has composed the core message content
- Before sending via the channel handler

## Inputs
- `raw_response` (string): The AI agent's unformatted response
- `channel` (string): Target channel — "email", "whatsapp", "web_form"
- `customer_name` (string): Customer's name for personalization
- `sentiment` (string): Current conversation sentiment

## Channel Rules

### Email
```
Max Length: 2000 characters
Tone: Professional, detailed, formal
Structure:
  - Greeting: "Hi {name}," or "Hello {name},"
  - Body: Full paragraphs, numbered steps for instructions
  - Links: Full URLs with descriptive text
  - Closing: "Best regards,\nTechCorp Support Team"
  - Signature: Include support email and hours

Allowed:
  ✅ Long explanations
  ✅ Multiple paragraphs
  ✅ Numbered/bulleted lists
  ✅ Full URLs
  ✅ Formal language
  ✅ Reference ticket numbers

Not Allowed:
  ❌ Emojis
  ❌ Casual language
  ❌ Abbreviations (u, pls, thx)
```

### WhatsApp  
```
Max Length: 1600 characters
Tone: Friendly, concise, conversational
Structure:
  - Greeting: "Hi {name}! 👋" or "Hey {name}!"
  - Body: Short sentences, one idea per message
  - Links: Shortened where possible
  - Closing: Brief, can use emoji

Allowed:
  ✅ Emojis (2-3 max, contextual)
  ✅ Casual language
  ✅ Bullet points with •
  ✅ Short sentences

Not Allowed:
  ❌ Long paragraphs
  ❌ Complex formatting
  ❌ Tables
  ❌ Multiple links
  ❌ Excessive emojis (no more than 3)
  
Split Rule: If response > 1600 chars, split into MAX 2 messages
```

### Web Form
```
Max Length: 1000 characters
Tone: Semi-formal, helpful, direct
Structure:
  - Greeting: "Thank you for reaching out, {name}."
  - Body: Clear paragraphs, bold key points
  - Links: Full URLs with context
  - Closing: "If you need further assistance, please don't hesitate to ask."
  - Reference: Include ticket number

Allowed:
  ✅ Moderate detail
  ✅ Bold text for emphasis (**key point**)
  ✅ Numbered steps
  ✅ Full URLs

Not Allowed:
  ❌ Emojis
  ❌ Overly casual language
  ❌ Very long responses
```

## Sentiment Adjustments

| Sentiment | Email | WhatsApp | Web Form |
|---|---|---|---|
| Positive | "Great question!" | "Great question! 😊" | "That's a great question." |
| Frustrated | "I understand the frustration..." | "I totally get it..." | "I understand your concern..." |
| Angry | "I sincerely apologize..." | "I'm really sorry about this..." | "We sincerely apologize..." |

## Output
```json
{
  "formatted_response": "Hi Sarah! 👋\n\nTo reset your password:\n• Go to Settings → Profile\n• Click 'Change Password'\n• Enter your new password\n\nLet me know if that works! 😊",
  "channel": "whatsapp",
  "character_count": 142,
  "within_limit": true,
  "messages_count": 1
}
```

## Notes
- Always respect character limits per channel
- Never send split messages on email or web — condense instead
- On WhatsApp, if a step-by-step guide is too long, send a link to docs instead
- Match customer's language style (if they use casual English, be casual back)
