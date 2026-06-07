from pydantic import BaseModel, Field
from typing import Optional, List

class IncidentCreate(BaseModel):
    title: str
    service: str
    severity: str
    symptoms: str
    logs: Optional[str] = None

class IncidentOut(BaseModel):
    id: str = Field(alias="_id")
    title: str
    service: str
    severity: str
    symptoms: str
    logs: Optional[str]
    status: str
    root_cause: Optional[str]
    resolution: Optional[str]
    latest_diagnosis: Optional[str]

    class Config:
        from_attributes = True
        populate_by_name = True

class DiagnoseResponse(BaseModel):
    incident_id: str
    diagnosis: str
    recalled_memories: List[str]

class ResolveRequest(BaseModel):
    root_cause: str
    resolution: str
