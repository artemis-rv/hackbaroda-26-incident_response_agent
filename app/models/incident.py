from beanie import Document
from datetime import datetime
from typing import Optional
from pydantic import Field

class Incident(Document):
    title: str
    service: str
    severity: str
    symptoms: str
    logs: Optional[str] = None
    
    status: str = "open"
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    latest_diagnosis: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

    class Settings:
        name = "incidents"
