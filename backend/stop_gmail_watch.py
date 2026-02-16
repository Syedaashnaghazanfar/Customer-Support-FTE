
import os
import sys
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

def stop_watch():
    print("Attempting to stop Gmail watch...")
    token_path = os.path.join("credentials", "gmail_token.json")
    
    if not os.path.exists(token_path):
        print(f"❌ Error: Gmail token not found at {token_path}")
        sys.exit(1)

    try:
        creds = Credentials.from_authorized_user_file(token_path)
        service = build("gmail", "v1", credentials=creds)
        
        service.users().stop(userId="me").execute()
        print("✅ SUCCESS: Gmail Watch has been STOPPED.")
        print("Google will no longer send push notifications to your Pub/Sub topic.")
    except Exception as e:
        print(f"❌ FAILED to stop watch: {e}")
        sys.exit(1)

if __name__ == "__main__":
    stop_watch()
