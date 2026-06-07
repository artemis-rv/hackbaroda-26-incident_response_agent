from beanie import Document
from datetime import datetime
from typing import List, Optional
from pydantic import Field

class MemoryStore(Document):
    incident_id: str
    title: str
    description: str
    symptoms: List[str]
    severity: str
    root_cause: str
    resolution: str
    lessons_learned: str
    embedding: List[float]
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "memory_store"
