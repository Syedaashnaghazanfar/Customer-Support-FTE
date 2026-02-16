
import asyncio
import os
from dotenv import load_dotenv
import asyncpg

load_dotenv()

async def debug_metrics():
    conn = await asyncpg.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "fte_db"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "postgres123"),
    )
    
    print("--- RAW AGENT METRICS (Last 10) ---")
    rows = await conn.fetch("SELECT * FROM agent_metrics ORDER BY recorded_at DESC LIMIT 10")
    for r in rows:
        print(dict(r))

    print("\n--- METRICS SUMMARY BY TYPE ---")
    rows = await conn.fetch("SELECT metric_type, COUNT(*), AVG(value) FROM agent_metrics GROUP BY metric_type")
    for r in rows:
        print(dict(r))
        
    await conn.close()

if __name__ == "__main__":
    asyncio.run(debug_metrics())
