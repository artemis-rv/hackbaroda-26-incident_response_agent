import asyncio
from sentence_transformers import SentenceTransformer

# Load model globally to avoid reloading overhead
_model = None

def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def generate_embedding(text: str) -> list[float]:
    model = _get_model()
    # model.encode returns a numpy array, convert to list of floats for MongoDB
    return model.encode(text).tolist()

def generate_incident_embedding(title: str, description: str, symptoms: list[str]) -> list[float]:
    # Semantic text representation of the incident
    text = f"Title: {title}\nDescription: {description}\nSymptoms: {', '.join(symptoms)}"
    return generate_embedding(text)
