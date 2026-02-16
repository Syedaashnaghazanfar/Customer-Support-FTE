
from channels.gmail_handler import gmail_handler
import asyncio

async def setup():
    try:
        await gmail_handler.initialize()
        result = gmail_handler.service.users().watch(userId='me', body={
            'topicName': 'projects/ambient-core-448106-g8/topics/gmail-notifications',
            'labelIds': ['INBOX']
        }).execute()
        print("✅ Watch set up successfully!")
        print(f"Result: {result}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(setup())
