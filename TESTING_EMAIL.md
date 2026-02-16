# 📧 Testing Email with Gmail API — Step by Step

## Prerequisites
- Docker Desktop installed and running
- Backend dependencies installed (`pip install -r backend/requirements.txt`)
- Gmail credentials already set up (✅ you've done this!)
  - `backend/credentials/gmail_credentials.json` exists

---

## Step 1: Verify Your Gmail Credentials Are in Place

Check these files exist:
```
backend/
├── credentials/
│   └── gmail_credentials.json   ← Downloaded from Google Cloud Console
├── .env                         ← Has GMAIL_CREDENTIALS_PATH set
```

Your `.env` should have:
```env
GMAIL_ENABLED=true
GMAIL_CREDENTIALS_PATH=./credentials/gmail_credentials.json
```

---

## Step 2: Start Everything (4 Terminals Needed)

### Terminal 1 — Docker (PostgreSQL + Kafka)
```powershell
cd d:\code\Q4\HACKATHON-5\backend
docker-compose up -d
```
Wait ~30 seconds, verify: `docker ps` (should show 3 containers)

### Terminal 2 — Backend API
```powershell
cd d:\code\Q4\HACKATHON-5\backend
uvicorn api.main:app --reload --port 8000
```

### Terminal 3 — ngrok Tunnel (needed for Gmail Pub/Sub)
```powershell
ngrok http 8000
```
Copy the public URL (e.g., `https://abc123.ngrok-free.app`)

### Terminal 4 — Frontend
```powershell
cd d:\code\Q4\HACKATHON-5\frontend\my-app
npm run dev
```

---

## Step 3: First-Time Gmail OAuth Login

The **first time** the Gmail handler runs, it will:
1. Automatically open a **browser window**
2. Ask you to **sign in** with the Google account you added as a test user
3. You may see a warning: "Google hasn't verified this app"
   - Click **"Advanced"** → **"Go to Customer Success FTE (unsafe)"**
4. Grant all 3 permissions (read, send, modify)
5. Click **"Allow"** → **"Allow"**
6. A `gmail_token.json` will be auto-created in `backend/credentials/`

After this, you won't need to log in again!

---

## Step 4: Set Up Gmail Pub/Sub (For Real-Time Email Processing)

This is **optional** for basic testing. If you skip this, you can test emails manually (Step 5).

### To set up real-time email push notifications:

1. Go to Google Cloud Console → **Pub/Sub** → **Topics**
   - URL: `https://console.cloud.google.com/cloudpubsub/topic/list`
2. Click **"Create Topic"**
   - Topic ID: `gmail-notifications`
3. Click **"Create Subscription"** on that topic
   - Subscription ID: `gmail-push`
   - Delivery type: **Push**
   - Endpoint URL: `https://YOUR-NGROK-URL/webhooks/gmail`
4. Grant Gmail permission to publish to your topic:
   - Go to the topic → **Permissions** tab
   - Add member: `gmail-api-push@system.gserviceaccount.com`
   - Role: **Pub/Sub Publisher**
5. Call Gmail API to watch for new messages (run once):
   ```python
   # You can run this in a Python shell:
   import requests
   requests.post(
       "https://gmail.googleapis.com/gmail/v1/users/me/watch",
       headers={"Authorization": "Bearer YOUR_ACCESS_TOKEN"},
       json={
           "topicName": "projects/YOUR_PROJECT_ID/topics/gmail-notifications",
           "labelIds": ["INBOX"]
       }
   )
   ```

> ⚠️ This step is complex. For simple testing, skip to Step 5 below.

---

## Step 5: Test Email Manually (Easiest Way)

You can test the Gmail webhook without Pub/Sub by simulating an email:

### Option A: Use curl to simulate a Gmail webhook
```powershell
curl -X POST http://localhost:8000/webhooks/gmail -H "Content-Type: application/json" -d "{\"message\":{\"data\":\"eyJlbWFpbEFkZHJlc3MiOiJ0ZXN0QGdtYWlsLmNvbSIsImhpc3RvcnlJZCI6IjEyMzQ1In0=\"}}"
```

### Option B: Test the API docs
1. Open http://localhost:8000/docs in your browser
2. Find the **POST /webhooks/gmail** endpoint
3. Click "Try it out"
4. Paste this test payload:
```json
{
  "message": {
    "data": "eyJlbWFpbEFkZHJlc3MiOiJ0ZXN0QGdtYWlsLmNvbSIsImhpc3RvcnlJZCI6IjEyMzQ1In0="
  }
}
```
5. Click "Execute"

### Option C: Test email sending directly
You can test that the Gmail API connection works by running a quick Python script:

```python
# Save as backend/test_gmail.py and run: python test_gmail.py
import asyncio
from channels.gmail_handler import gmail_handler

async def test():
    # This will trigger OAuth login on first run
    await gmail_handler.initialize()
    print("✅ Gmail API connected successfully!")
    
    # Fetch unread messages
    messages = await gmail_handler.get_unread_messages(max_results=3)
    print(f"Found {len(messages)} unread messages")
    for msg in messages:
        print(f"  From: {msg['from_email']}")
        print(f"  Subject: {msg['subject']}")
        print(f"  Body: {msg['body'][:100]}...")
        print()

asyncio.run(test())
```

---

## Step 6: Full Email Test (Send & Receive)

1. Send an email **from another email account** to your Gmail address
2. Subject: `Can't access my dashboard`
3. Body: `I'm getting a 403 error when trying to access analytics. Please help.`
4. If Pub/Sub is set up → the backend processes it automatically
5. If not → run the test script from Option C above to fetch and process it

---

## How It Works

```
Someone sends email to your Gmail
       │
       ▼
Gmail API (Pub/Sub notification)
       │
       ▼
ngrok tunnel → Backend :8000 /webhooks/gmail
       │
       ▼
Backend fetches the email via Gmail API
       │
       ▼
AI Agent (Groq LLM) generates response
       │
       ▼
Gmail API sends reply back to the sender
```

---

## After First-Time Setup, Your Credentials Folder Should Have:

```
backend/credentials/
├── gmail_credentials.json   ← Downloaded from Google Cloud (you have this ✅)
└── gmail_token.json         ← Auto-created after first OAuth login
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Google hasn't verified this app" warning | Click Advanced → Go to app (unsafe). Normal for test apps |
| `FileNotFoundError: gmail_credentials.json` | Make sure the file is at `backend/credentials/gmail_credentials.json` |
| `Token has been expired or revoked` | Delete `gmail_token.json` and re-authenticate |
| Gmail API not enabled | Go to Google Cloud Console → APIs & Services → Enable Gmail API |
| OAuth screen not showing scopes | Re-configure OAuth consent screen and add the 3 Gmail scopes |
| `redirect_uri_mismatch` error | Make sure OAuth client type is "Desktop app" not "Web application" |

---

## Quick Reference: All Services to Run

| Terminal | Command | Purpose |
|----------|---------|---------|
| Terminal 1 | `docker-compose up -d` (in `backend/`) | PostgreSQL + Kafka |
| Terminal 2 | `uvicorn api.main:app --reload --port 8000` (in `backend/`) | Backend API |
| Terminal 3 | `ngrok http 8000` | Public tunnel |
| Terminal 4 | `npm run dev` (in `frontend/my-app/`) | Frontend |
