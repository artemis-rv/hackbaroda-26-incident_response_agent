from fastapi import APIRouter, HTTPException
from typing import List
from bson import ObjectId
from app.models.incident import Incident
from app.models.schemas import IncidentCreate, IncidentResponse, TimelineEvent

router = APIRouter()

def serialize_incident(obj: Incident) -> dict:
    data = obj.model_dump()
    data["incident_id"] = str(obj.id)
    return data

@router.post("", response_model=IncidentResponse)
async def create_incident(payload: IncidentCreate):
    obj = Incident(
        title=payload.title,
        description=payload.description,
        symptoms=payload.symptoms,
        severity=payload.severity,
        service=payload.service,
        environment=payload.environment,
        tags=payload.tags,
        timeline=[TimelineEvent(event="Incident reported")]
    )
    await obj.insert()
    return serialize_incident(obj)

@router.get("", response_model=List[IncidentResponse])
async def list_incidents():
    incidents = await Incident.find_all().to_list()
    return [serialize_incident(obj) for obj in incidents]

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(status_code=400, detail="Invalid Incident ID")
    obj = await Incident.get(ObjectId(incident_id))
    if not obj:
        raise HTTPException(status_code=404, detail="Incident not found")
    return serialize_incident(obj)
