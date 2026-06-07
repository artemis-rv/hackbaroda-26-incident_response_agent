import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv(".env")

async def main():
    HINDSIGHT_BASE_URL = os.getenv("HINDSIGHT_BASE_URL", "").strip().rstrip("/")
    HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY", "").strip()
    HINDSIGHT_NAMESPACE = os.getenv("HINDSIGHT_NAMESPACE", "incident-memory").strip()
    
    url = f"{HINDSIGHT_BASE_URL}/v1/default/banks/{HINDSIGHT_NAMESPACE}/memories"
    payload = {
        "items": [
            {
                "content": "database connection pool exhausted due to high traffic.",
                "metadata": {"severity": "high"}
            }
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {HINDSIGHT_API_KEY}",
        "Content-Type": "application/json",
    }
    
    async with httpx.AsyncClient() as client:
        res = await client.post(url, headers=headers, json=payload)
        print("Insert Status Code:", res.status_code)
        
        await asyncio.sleep(2)
        
        url_recall = f"{HINDSIGHT_BASE_URL}/v1/default/banks/{HINDSIGHT_NAMESPACE}/memories/recall"
        payload_recall = {
            "query": "database connection pool exhausted"
        }
        res_recall = await client.post(url_recall, headers=headers, json=payload_recall)
        print("Recall Status:", res_recall.status_code)
        if res_recall.status_code < 300:
            print("Recall Data:", res_recall.json())
        else:
            print("Recall Error:", res_recall.text)

if __name__ == "__main__":
    asyncio.run(main())
