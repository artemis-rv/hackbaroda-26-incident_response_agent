from beanie import Document
from datetime import datetime
from typing import Optional, List
from pydantic import Field
from app.models.schemas import Diagnosis, Resolution, Memory, TimelineEvent

class Incident(Document):
    title: str
    description: str
    symptoms: List[str]
    severity: str = "medium"
    service: Optional[str] = None
    environment: str = "production"
    tags: List[str] = []
    logs: Optional[str] = None
    affected_services: List[str] = []
    
    status: str = "open"
    
    diagnosis: Optional[Diagnosis] = None
    resolution: Optional[Resolution] = None
    memory: Optional[Memory] = None
    rca_report: Optional[str] = None
    
    timeline: List[TimelineEvent] = []
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

    class Settings:
        name = "incidents"
