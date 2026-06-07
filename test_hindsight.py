import os
import requests
from dotenv import load_dotenv

def test_hindsight():
    # Load variables from app/.env
    env_path = os.path.join('app', '.env')
    load_dotenv(env_path)

    base_url = os.getenv("HINDSIGHT_BASE_URL")
    if not base_url:
        print("WARNING: HINDSIGHT_BASE_URL is not set in app/.env")
        base_url = "https://api.hindsight.vectorize.io"
        print(f"Testing URL: {base_url}\n")
        
    api_key = os.getenv("HINDSIGHT_API_KEY")
    if not api_key or api_key == "your_key":
        print("ERROR: HINDSIGHT_API_KEY is not set correctly in app/.env")
        return

    base_url = base_url.rstrip("/")
    namespace = os.getenv("HINDSIGHT_NAMESPACE", "incident-memory")
    
    print(f"Testing connection to Hindsight...")
    print(f"URL: {base_url}")
    print(f"API Key: {api_key[:5]}...{api_key[-5:]}\n")
    
    url = f"{base_url}/v1/default/banks/{namespace}/memories/recall"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "query": "test connection",
    }
    
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if res.status_code >= 200 and res.status_code < 300:
            print("SUCCESS: Successfully connected to Hindsight Memory Bank!")
            print(f"Response: {res.json()}")
        else:
            print(f"ERROR: Connection failed with status {res.status_code}")
            print(f"Error details: {res.text}")
            
    except Exception as e:
        print("ERROR: An unexpected error occurred while connecting to Hindsight.")
        print(f"Details: {e}")

if __name__ == "__main__":
    test_hindsight()
