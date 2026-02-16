# 🟢 Testing WhatsApp with Twilio — Step by Step

## Prerequisites
- Docker Desktop installed and running
- Backend dependencies installed (`pip install -r backend/requirements.txt`)
- A phone with WhatsApp

---

## Step 1: Create a Free Twilio Account

1. Go to **https://www.twilio.com/try-twilio**
2. Sign up (no credit card needed)
3. Verify your email and phone number

---

## Step 2: Get Your Twilio Credentials

1. Log in to the Twilio Console: `https://console.twilio.com/`
2. On the dashboard you'll see:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click the eye icon to reveal)
3. Update `backend/.env` with your **real** credentials:

```env
TWILIO_ACCOUNT_SID=AC_your_real_account_sid_here
TWILIO_AUTH_TOKEN=your_real_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

> ⚠️ The values currently in `.env` are dummy placeholders — replace them!

---

## Step 3: Activate the Twilio WhatsApp Sandbox

1. In Twilio Console → **Messaging → Try It Out → Send a WhatsApp Message**
   - Direct link: `https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn`
2. You'll see instructions to **join the sandbox**
3. Open **WhatsApp** on your phone
4. Send a message to **+1 415 523 8886**
5. The message will be something like: **`join hungry-cat`** (Twilio tells you the exact words)
6. You'll get a reply: *"You've been added to the sandbox!"*

---

## Step 4: Install ngrok (Makes Your Local Server Public)

Twilio needs to reach your backend, so you need a public URL.

**Install ngrok:**
```powershell
# Option 1: Using Chocolatey
choco install ngrok

# Option 2: Using winget
winget install ngrok

# Option 3: Download manually from https://ngrok.com/download
```

**Sign up at https://ngrok.com** (free) and get your authtoken, then:
```powershell
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

---

## Step 5: Start Everything (4 Terminals Needed)

### Terminal 1 — Docker (PostgreSQL + Kafka)
```powershell
cd d:\code\Q4\HACKATHON-5\backend
docker-compose up -d
```
Wait ~30 seconds, then verify: `docker ps` (should show 3 containers)

### Terminal 2 — Backend API
```powershell
cd d:\code\Q4\HACKATHON-5\backend
uvicorn api.main:app --reload --port 8000
```

### Terminal 3 — ngrok Tunnel
```powershell
ngrok http 8000
```
Copy the public URL (e.g., `https://abc123.ngrok-free.app`)

### Terminal 4 — Frontend (optional, for web form testing)
```powershell
cd d:\code\Q4\HACKATHON-5\frontend\my-app
npm run dev
```

---

## Step 6: Configure Twilio Webhook URL

1. Go to Twilio Console → **Messaging → Settings → WhatsApp Sandbox Settings**
   - Direct link: `https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox`
2. Set **"When a message comes in"** to:
   ```
   https://YOUR-NGROK-URL/webhooks/whatsapp
   ```
   Example: `https://abc123.ngrok-free.app/webhooks/whatsapp`
3. HTTP Method: **POST**
4. Click **Save**

---

## Step 7: Test It! 🎉

1. Open **WhatsApp** on your phone
2. Send a message to **+1 415 523 8886**, for example:
   ```
   Hi, I can't access my dashboard. Getting a 403 error.
   ```
3. Wait a few seconds...
4. You should receive an **AI-generated support response** back on WhatsApp! 🤖

---

## How It Works

```
Your Phone (WhatsApp)
       │
       ▼
Twilio Cloud (receives message)
       │
       ▼
ngrok tunnel (forwards to your PC)
       │
       ▼
Backend :8000 /webhooks/whatsapp
       │
       ▼
AI Agent (Groq LLM) generates response
       │
       ▼
Response sent back through Twilio → Your WhatsApp
```

---

## Quick Test Without a Phone (curl command)

To just test the webhook endpoint works:
```powershell
curl -X POST http://localhost:8000/webhooks/whatsapp -H "Content-Type: application/x-www-form-urlencoded" -d "Body=I+need+help+with+login&From=whatsapp%3A%2B1234567890&ProfileName=TestUser"
```

Expected response (TwiML):
```xml
<?xml version="1.0" encoding="UTF-8"?><Response></Response>
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No reply on WhatsApp | Check ngrok is running and webhook URL is correct in Twilio |
| `Connection refused` | Make sure backend is running on port 8000 |
| Twilio says "undelivered" | Make sure you joined the sandbox first (Step 3) |
| ngrok says "tunnel expired" | Free ngrok tunnels expire after ~2 hours. Restart ngrok |
| Docker containers not running | Run `docker-compose up -d` again |
