import asyncio
import numpy as np
from app.models.memory import MemoryStore
from app.models.schemas import SimilarIncident
from app.services.embedding_service import generate_incident_embedding

async def store_memory(incident_data, resolution_data):
    # This runs asynchronously but the embedding generation is CPU bound.
    # We can use asyncio.to_thread to run it without blocking the event loop.
    embedding = await asyncio.to_thread(
        generate_incident_embedding, 
        incident_data.title, 
        incident_data.description, 
        incident_data.symptoms
    )
    
    memory = MemoryStore(
        incident_id=str(incident_data.id),
        title=incident_data.title,
        description=incident_data.description,
        symptoms=incident_data.symptoms,
        severity=incident_data.severity,
        root_cause=resolution_data.actual_root_cause,
        resolution=resolution_data.fix_applied,
        lessons_learned=resolution_data.lessons_learned,
        embedding=embedding
    )
    await memory.insert()

def _calculate_similarities(query_embedding, memories):
    if not memories:
        return []
    
    query_vec = np.array(query_embedding)
    # Norm of query
    q_norm = np.linalg.norm(query_vec)
    if q_norm == 0:
        return []

    results = []
    for mem in memories:
        mem_vec = np.array(mem.embedding)
        m_norm = np.linalg.norm(mem_vec)
        if m_norm == 0:
            score = 0.0
        else:
            score = float(np.dot(query_vec, mem_vec) / (q_norm * m_norm))
        
        results.append({
            "memory": mem,
            "score": score
        })
    
    # Sort descending
    results.sort(key=lambda x: x["score"], reverse=True)
    return results

async def find_similar_incidents(title: str, description: str, symptoms: list[str], limit: int = 5):
    # Fetch all memories
    memories = await MemoryStore.find_all().to_list()
    if not memories:
        return []

    # Generate query embedding in a thread
    query_embedding = await asyncio.to_thread(
        generate_incident_embedding, 
        title, 
        description, 
        symptoms
    )

    # Calculate similarities in a thread to avoid blocking if memory count is high
    ranked_results = await asyncio.to_thread(_calculate_similarities, query_embedding, memories)
    
    # Take top limit
    top_matches = ranked_results[:limit]
    
    similar_incidents = []
    for match in top_matches:
        mem = match["memory"]
        similar_incidents.append(SimilarIncident(
            incident_id=mem.incident_id,
            title=mem.title,
            root_cause=mem.root_cause,
            resolution=mem.resolution,
            similarity_score=match["score"]
        ))
    
    return similar_incidents
