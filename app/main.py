import os
from dotenv import load_dotenv

# Load environment variables from app/.env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.incidents import router as incidents_router
from app.api.diagnose import router as diagnose_router
from app.models.db import init_db

app = FastAPI(title="Incident Response Agent with Hindsight")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

app.include_router(incidents_router, prefix="/incidents", tags=["incidents"])
app.include_router(diagnose_router, prefix="/incidents", tags=["diagnose"])

@app.get("/")
def health():
    return {"status": "ok", "service": "incident-response-agent"}
