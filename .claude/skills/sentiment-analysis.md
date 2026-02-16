# Sentiment Analysis Skill

## Purpose
Analyze the emotional tone and urgency of incoming customer messages to calibrate response tone and trigger escalation when needed.

## When to Use
- Every incoming customer message is analyzed for sentiment
- Used to adjust response tone (formal/empathetic/urgent)
- Used to detect escalation triggers (anger, threats, distress)

## Inputs
- `message` (string): The customer's message content
- `channel` (string): Source channel — "email", "whatsapp", "web_form"
- `previous_sentiment` (float, optional): Previous message sentiment for trend tracking

## Process
1. Analyze the message text for emotional indicators
2. Check for trigger words (legal threats, profanity, urgency markers)
3. Assign a sentiment score from -1.0 (very negative) to +1.0 (very positive)
4. Classify into sentiment category
5. Compare with previous_sentiment for trend detection
6. If sentiment < -0.7, flag for escalation review

## Sentiment Categories

| Score Range | Category | Example |
|---|---|---|
| 0.7 to 1.0 | very_positive | "You guys are awesome! Thanks!" |
| 0.3 to 0.7 | positive | "Thanks for the help" |
| -0.3 to 0.3 | neutral | "How do I reset my password?" |
| -0.7 to -0.3 | negative | "This is really frustrating" |
| -1.0 to -0.7 | very_negative | "TERRIBLE service! Nothing works!" |

## Trigger Words

### Immediate Escalation Triggers
- Legal: "lawyer", "attorney", "lawsuit", "sue", "legal"
- Urgency: "emergency", "critical", "down", "production"
- Data: "lost data", "deleted", "breach", "hacked"

### Tone Adjustment Triggers
- Frustration: "frustrated", "annoyed", "again", "still not working"
- Impatience: "how long", "waiting", "when", "already told you"
- Confusion: "don't understand", "confused", "makes no sense"

### Human Request Triggers
- Explicit: "human", "agent", "representative", "real person", "manager"

## Output
```json
{
  "score": -0.45,
  "category": "negative",
  "confidence": 0.85,
  "trigger_words_found": ["frustrated"],
  "escalation_needed": false,
  "recommended_tone": "empathetic",
  "trend": "declining"
}
```

## Response Tone Mapping

| Sentiment | Recommended Tone |
|---|---|
| very_positive | Match energy, express gratitude |
| positive | Warm, standard professional |
| neutral | Clear, helpful, direct |
| negative | Empathetic, acknowledge frustration |
| very_negative | De-escalation, offer human support |

## Notes
- WhatsApp messages tend to be shorter and more casual — adjust thresholds
- Emojis should be factored in (😡 = negative, 👍 = positive)
- ALL CAPS in messages indicates heightened emotion
- Empty or single-word messages may indicate frustration or impatience
