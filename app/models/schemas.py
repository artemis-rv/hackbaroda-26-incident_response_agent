# schemas.py

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# -----------------------------
# Similar Incident Match
# -----------------------------
class SimilarIncident(BaseModel):
    incident_id: str
    score: float


# -----------------------------
# AI Diagnosis Output
# -----------------------------
class Diagnosis(BaseModel):
    root_causes: List[str] = []
    confidence_score: Optional[float] = None
    impact_analysis: Optional[str] = None
    recommended_actions: List[str] = []
    prevention_steps: List[str] = []
    similar_incidents: List[SimilarIncident] = []


# -----------------------------
# Resolution Details
# -----------------------------
class Resolution(BaseModel):
    actual_root_cause: Optional[str] = None
    fix_applied: Optional[str] = None
    lessons_learned: Optional[str] = None
    resolved_by: Optional[str] = None
    resolution_time_minutes: Optional[int] = None


# -----------------------------
# Hindsight Memory Metadata
# -----------------------------
class Memory(BaseModel):
    stored_in_hindsight: bool = False
    memory_summary: Optional[str] = None


# -----------------------------
# Timeline Events
# -----------------------------
class TimelineEvent(BaseModel):
    event: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# -----------------------------
# Incident Base Schema
# -----------------------------
class IncidentBase(BaseModel):
    title: str
    description: str
    symptoms: List[str]

    severity: str = "medium"  # low, medium, high, critical

    service: Optional[str] = None
    environment: str = "production"

    tags: List[str] = []
    
    logs: Optional[str] = None
    affected_services: List[str] = []


# -----------------------------
# Create Incident Request
# -----------------------------
class IncidentCreate(IncidentBase):
    timeline: Optional[List[TimelineEvent]] = None


# -----------------------------
# Resolve Incident Request
# -----------------------------
class IncidentResolve(BaseModel):
    actual_root_cause: str
    fix_applied: str
    lessons_learned: str
    resolved_by: Optional[str] = "Engineer"
    resolution_time_minutes: int


# -----------------------------
# Incident Response Model
# -----------------------------
class IncidentResponse(IncidentBase):
    incident_id: str

    status: str = "open"

    diagnosis: Optional[Diagnosis] = None
    resolution: Optional[Resolution] = None
    memory: Optional[Memory] = None

    timeline: List[TimelineEvent] = []

    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------
# Diagnose Response
# -----------------------------
class DiagnoseResponse(BaseModel):
    incident_id: str

    root_causes: List[str]
    confidence_score: float
    impact_analysis: str

    recommended_actions: List[str]
    prevention_steps: List[str]

    similar_incidents: List[SimilarIncident]

    investigation_mode: bool = False