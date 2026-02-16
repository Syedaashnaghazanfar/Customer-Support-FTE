# 📋 Operations Runbook — Customer Success FTE

## Service Overview

| Service | Port | Health Check |
|---|---|---|
| FastAPI | 8000 | `GET /health` |
| PostgreSQL | 5432 | `pg_isready -U postgres` |
| Kafka | 9092 | Broker auto-creates topics |
| Zookeeper | 2181 | N/A |
| Next.js Frontend | 3000 | `npm run dev` |

---

## Starting Services

### Local Development (Recommended Order)

```bash
# 1. Start infrastructure
cd backend
docker-compose up -d

# 2. Wait for PostgreSQL to be ready (schema auto-applies)
docker-compose logs -f postgres  # Wait for "database system is ready"

# 3. Start API
uvicorn api.main:app --reload --port 8000

# 4. (Optional) Start Kafka message processor worker
python -m workers.message_processor

# 5. Start frontend
cd frontend/my-app
npm run dev
```

### Kubernetes

```bash
# Apply all manifests
kubectl apply -f backend/k8s/deployment.yaml

# Check status
kubectl get pods -l app=fte-api
kubectl get pods -l app=fte-worker
```

---

## Troubleshooting

### PostgreSQL won't start
```bash
docker-compose down -v   # Remove volumes
docker-compose up -d     # Fresh start (schema re-applies)
```

### Kafka connection refused
```bash
docker-compose restart kafka
# Ensure KAFKA_ADVERTISED_LISTENERS matches your host
```

### Groq API errors
1. Verify `OPENAI_API_KEY` is set to your Groq API key
2. Verify `OPENAI_BASE_URL=https://api.groq.com/openai/v1`
3. Check rate limits at [console.groq.com](https://console.groq.com)

### Frontend can't connect to API
1. Ensure API is running on port 8000
2. Check CORS: frontend must be on `localhost:3000`
3. Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in frontend `.env.local`

---

## Monitoring

### Check API Logs
```bash
# Local
uvicorn api.main:app --log-level debug

# Docker
docker logs fte-api -f

# Kubernetes
kubectl logs -f deployment/fte-api
```

### Metrics Dashboard
Visit `http://localhost:3000/dashboard` for real-time metrics.

### Database Queries
```bash
# Connect to PostgreSQL
docker exec -it fte-postgres psql -U postgres -d fte_db

# Useful queries
SELECT COUNT(*) FROM tickets;
SELECT channel, COUNT(*) FROM messages GROUP BY channel;
SELECT metric_type, AVG(value) FROM agent_metrics GROUP BY metric_type;
```

---

## Testing

```bash
# Run all tests
cd backend && pytest tests/ -v

# Run specific test file
pytest tests/test_transition.py -v

# Load test (start API first)
locust -f tests/load_test.py --host=http://localhost:8000
# Open http://localhost:8089 for Locust UI

# 24-hour stress test
locust -f tests/load_test.py --host=http://localhost:8000 \
  --headless -u 10 -r 1 --run-time 24h
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | Groq API key |
| `OPENAI_BASE_URL` | ✅ | — | `https://api.groq.com/openai/v1` |
| `AGENT_MODEL` | No | `llama-3.3-70b-versatile` | Groq model name |
| `POSTGRES_HOST` | No | `localhost` | Database host |
| `POSTGRES_PORT` | No | `5432` | Database port |
| `POSTGRES_DB` | No | `fte_db` | Database name |
| `POSTGRES_USER` | No | `postgres` | Database user |
| `POSTGRES_PASSWORD` | No | `postgres123` | Database password |
| `KAFKA_BOOTSTRAP_SERVERS` | No | `localhost:9092` | Kafka brokers |
| `TWILIO_ACCOUNT_SID` | No | — | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | No | — | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | No | `whatsapp:+14155238886` | Twilio sandbox |
