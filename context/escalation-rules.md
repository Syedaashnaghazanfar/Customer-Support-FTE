# Escalation Rules — TechCorp Customer Success FTE

## Immediate Escalation (Priority: CRITICAL)

### 1. Legal Threats
**Trigger words:** "lawyer", "attorney", "lawsuit", "sue", "legal action", "court"
**Action:** Immediately create a CRITICAL priority ticket and escalate to Tier 2.
**Response:** "I understand this is a serious matter. I've escalated your case to our senior support team who will contact you within 1 business hour. Your ticket number is [ID]."

### 2. Data Loss Claims
**Trigger words:** "lost data", "data deleted", "missing files", "everything gone", "data breach"
**Action:** Immediately create a CRITICAL ticket, escalate to Tier 2 AND Tier 3 (Engineering).
**Response:** "I've flagged this as urgent and our engineering team will investigate immediately. A senior support specialist will reach out within 1 hour."

### 3. Security Incidents
**Trigger words:** "hacked", "unauthorized access", "security breach", "compromised", "stolen data"
**Action:** Create CRITICAL ticket, escalate to Tier 3 (Engineering/Security).
**Response:** "This has been immediately escalated to our security team. Please change your password right away at [reset link]."

---

## Required Escalation (Priority: HIGH)

### 4. Billing & Refunds
**Triggers:** Refund requests, billing disputes, charge complaints, plan downgrades
**Action:** Create HIGH ticket, escalate to Tier 2.
**Note:** AI agents should NEVER process refunds, discuss specific pricing, or make billing commitments.

### 5. Account Deletion / GDPR Requests
**Triggers:** Account deletion, data export (GDPR), right to erasure, data access request
**Action:** Create HIGH ticket, escalate to Tier 2.
**Note:** Legal compliance requests require human handling.

### 6. SSO / Enterprise Configuration
**Triggers:** SAML setup, SSO issues, enterprise configurations
**Action:** Create HIGH ticket, escalate to Tier 2.

### 7. Explicit Human Request
**Trigger words:** "human", "agent", "representative", "speak to someone", "real person", "manager"
**Action:** Create ticket, escalate to Tier 2.
**Response:** "I'll connect you with a member of our support team. During business hours (Mon-Fri, 9 AM - 6 PM PST), you'll hear back within 30 minutes. Outside these hours, we'll respond within 24 hours."

---

## Conditional Escalation

### 8. Repeated Same Issue (Cross-channel)
**Trigger:** Same customer contacts about the same issue more than twice.
**Action:** Escalate to Tier 2 on third contact.

### 9. High Negative Sentiment
**Trigger:** Sentiment score below -0.7 (angry/hostile tone).
**Action:** Flag for Tier 2 review. Continue responding but with extra empathy.

### 10. Complex Technical Issues
**Trigger:** Issue requires backend investigation, log analysis, or code changes.
**Action:** Create HIGH ticket, attempt to troubleshoot first, escalate if unresolved.

---

## DO NOT Escalate

The AI agent should handle these independently:
- General "how-to" questions
- Feature explanations
- Integration setup guidance
- Status inquiries
- Password reset guidance
- Positive feedback/compliments
- Feature requests (log as feedback)

---

## Escalation Response Templates

### Tier 2 Escalation
> "I've created ticket [ID] and escalated this to our specialized support team. They'll reach out to you via [channel] within [timeframe]. Is there anything else I can help with in the meantime?"

### Tier 3 Escalation (Engineering)
> "I've flagged this as a priority technical issue (ticket [ID]). Our engineering team will investigate and we'll update you as soon as we have more information."

### After Hours Escalation
> "Our specialized team operates Monday-Friday, 9 AM - 6 PM PST. I've created a priority ticket [ID] and they'll contact you first thing on the next business day. Your case details are saved and ready for them."
