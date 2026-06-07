import os
import httpx
from typing import List, Dict

HINDSIGHT_BASE_URL = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io").strip().rstrip("/")
HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY", "").strip()
HINDSIGHT_NAMESPACE = os.getenv("HINDSIGHT_NAMESPACE", "incident-memory").strip()

def _headers():
    return {
        "Authorization": f"Bearer {HINDSIGHT_API_KEY}",
        "Content-Type": "application/json",
    }

async def recall_memories(query: str, top_k: int = 3) -> List[str]:
    """
    Recalls memories from Vectorize Hindsight API.
    """
    if not HINDSIGHT_BASE_URL or not HINDSIGHT_API_KEY:
        return []

    url = f"{HINDSIGHT_BASE_URL}/v1/default/banks/{HINDSIGHT_NAMESPACE}/memories/recall"
    payload = {
        "query": query
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(url, headers=_headers(), json=payload)
            if res.status_code >= 300:
                print(f"Hindsight recall failed: {res.status_code} - {res.text}")
                return []
                
            data = res.json()
            items = data.get("results", data.get("memories", data.get("items", [])))
            
            return [
                {
                    "text": item if isinstance(item, str) else item.get("content", item.get("text", str(item))),
                    "metadata": item.get("metadata", {}) if isinstance(item, dict) else {}
                }
                for item in items
            ]
    except Exception as e:
        print(f"Hindsight recall error: {e}")
        return []

async def retain_memory(text: str, metadata: Dict):
    """
    Stores memories in Vectorize Hindsight API.
    """
    if not HINDSIGHT_BASE_URL or not HINDSIGHT_API_KEY:
        return

    url = f"{HINDSIGHT_BASE_URL}/v1/default/banks/{HINDSIGHT_NAMESPACE}/memories"
    payload = {
        "items": [
            {
                "content": text,
                "metadata": metadata
            }
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(url, headers=_headers(), json=payload)
            if res.status_code >= 300:
                print(f"Hindsight retain failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Hindsight retain error: {e}")
