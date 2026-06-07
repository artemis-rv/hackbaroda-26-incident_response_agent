import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

DATABASE_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017/incidentiq")

async def init_db():
    client = AsyncIOMotorClient(DATABASE_URL)
    from app.models.incident import Incident
    await init_beanie(database=client.get_default_database(), document_models=[Incident])
