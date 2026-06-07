from fastapi import APIRouter, HTTPException
from typing import List
from bson import ObjectId
from app.models.incident import Incident
from app.models.schemas import IncidentCreate, IncidentOut

router = APIRouter()

@router.post("", response_model=IncidentOut)
async def create_incident(payload: IncidentCreate):
    obj = Incident(
        title=payload.title,
        service=payload.service,
        severity=payload.severity,
        symptoms=payload.symptoms,
        logs=payload.logs,
    )
    await obj.insert()
    return obj

@router.get("", response_model=List[IncidentOut])
async def list_incidents():
    return await Incident.find_all().to_list()

@router.get("/{incident_id}", response_model=IncidentOut)
async def get_incident(incident_id: str):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(status_code=400, detail="Invalid Incident ID")
    obj = await Incident.get(ObjectId(incident_id))
    if not obj:
        raise HTTPException(status_code=404, detail="Incident not found")
    return obj
