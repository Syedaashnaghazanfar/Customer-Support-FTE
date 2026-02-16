# 🏭 Customer Success AI FTE — TechCorp Support

> **24/7 AI-Powered Customer Success Employee** handling Email, WhatsApp, and Web Form support for TechCorp ProjectHub.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker Desktop
- API Keys: [Groq](https://console.groq.com/), Google Cloud (Gmail), Twilio (optional)

### 1. Clone & Setup Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start Infrastructure

```bash
cd backend
docker-compose up -d
```

This starts PostgreSQL (with pgvector + schema auto-loaded) and Kafka.

### 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the API

```bash
cd backend
uvicorn api.main:app --reload --port 8000
```

### 5. Start the Frontend

```bash
cd frontend/my-app
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
HACKATHON-5/
├── backend/
│   ├── agent/                    # AI Agent (OpenAI Agents SDK + Groq)
│   │   ├── customer_success_agent.py  # Main agent factory
│   │   ├── prompts.py                 # System prompts with channel awareness
│   │   ├── tools.py                   # @function_tool implementations
│   │   └── formatters.py             # Channel-specific response formatters
│   ├── api/
│   │   └── main.py               # FastAPI service (all endpoints)
│   ├── channels/
│   │   ├── gmail_handler.py      # Gmail API + Pub/Sub
│   │   ├── whatsapp_handler.py   # Twilio WhatsApp
│   │   └── web_form_handler.py   # Web form validation
│   ├── database/
│   │   ├── schema.sql            # PostgreSQL schema (8 tables + pgvector)
│   │   └── queries.py            # Async DB operations (asyncpg)
│   ├── workers/
│   │   └── message_processor.py  # Unified message processing pipeline
│   ├── tests/
│   │   ├── test_transition.py    # Unit tests for formatters & validation
│   │   ├── test_multichannel_e2e.py  # API endpoint tests
│   │   └── load_test.py          # Locust load testing
│   ├── k8s/
│   │   └── deployment.yaml       # Kubernetes manifests
│   ├── mcp_server.py             # FastMCP incubation server
│   ├── kafka_client.py           # Kafka producer/consumer
│   ├── docker-compose.yml        # PostgreSQL + Kafka + Zookeeper
│   ├── Dockerfile                # Multi-stage production build
│   └── requirements.txt          # Python dependencies
├── frontend/my-app/
│   └── app/
│       ├── page.tsx              # Landing page
│       ├── support/page.tsx      # Support form (REQUIRED)
│       ├── status/page.tsx       # Ticket status lookup
│       ├── dashboard/page.tsx    # Metrics dashboard
│       ├── layout.tsx            # Root layout + navbar
│       └── globals.css           # Design system
├── context/                      # Knowledge base for the AI agent
├── specs/                        # FTE specification documents
└── .claude/skills/               # Agent skill definitions
```

## 🛠 Tech Stack

| Component | Technology | Cost |
|---|---|---|
| AI Model | Groq (llama-3.3-70b-versatile) | Free |
| Agent Framework | OpenAI Agents SDK | Free |
| Backend | FastAPI + Python 3.11 | Free |
| Database | PostgreSQL 16 + pgvector | Free |
| Streaming | Apache Kafka | Free |
| MCP | FastMCP | Free |
| Frontend | Next.js + Tailwind CSS | Free |
| Email | Gmail API | Free |
| WhatsApp | Twilio (sandbox) | Free |

## 🧪 Testing

```bash
# Unit + integration tests
cd backend
pytest tests/ -v

# Load testing (requires API running)
locust -f tests/load_test.py --host=http://localhost:8000
```

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/support/submit` | Web form submission |
| `GET` | `/support/ticket/{id}` | Ticket status lookup |
| `POST` | `/webhooks/gmail` | Gmail Pub/Sub webhook |
| `POST` | `/webhooks/whatsapp` | Twilio WhatsApp webhook |
| `POST` | `/customers/lookup` | Customer history lookup |
| `GET` | `/metrics/channels` | Channel performance metrics |

## 🎨 Frontend Pages

| Page | Path | Description |
|---|---|---|
| Landing | `/` | Hero section with stats and features |
| Support Form | `/support` | **Required** support ticket submission |
| Ticket Status | `/status` | Look up ticket by number |
| Dashboard | `/dashboard` | Real-time metrics and agent status |
