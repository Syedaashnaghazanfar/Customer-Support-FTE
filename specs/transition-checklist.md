# Transition Checklist

## MCP → Production Mapping

| MCP Tool | Production File | Status |
|---|---|---|
| `search_knowledge_base` | `agent/tools.py` → `@function_tool` | [ ] |
| `create_ticket` | `agent/tools.py` → `@function_tool` | [ ] |
| `get_customer_history` | `agent/tools.py` → `@function_tool` | [ ] |
| `escalate_to_human` | `agent/tools.py` → `@function_tool` | [ ] |
| `send_response` | `agent/tools.py` → `@function_tool` | [ ] |

## Component Transition

| Prototype | Production | Status |
|---|---|---|
| In-memory stores | PostgreSQL (asyncpg) | [ ] |
| Print statements | Kafka event streaming | [ ] |
| Simple text match | pgvector semantic search | [ ] |
| Single channel | 3 channel handlers | [ ] |
| CLI interface | FastAPI REST API | [ ] |
| Manual testing | Automated test suite | [ ] |

## Verification Needed
- [ ] All 5 tools produce same outputs as MCP versions
- [ ] Edge cases from incubation are handled
- [ ] Channel formatting matches brand voice guide
- [ ] Escalation rules are properly enforced
- [ ] Cross-channel customer identity works
