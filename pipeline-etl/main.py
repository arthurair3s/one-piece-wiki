from fastapi import FastAPI, BackgroundTasks, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import database
import scraper
import publisher
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# Initialize database tables on start
database.init_db()

app = FastAPI(
    title="Grand Line ETL Microservice",
    description="MVP de pipeline para extração, staging e publicação de dados do universo de One Piece.",
    version="1.0.0"
)

# Schemas
class CreateJobDTO(BaseModel):
    scope_type: str  # e.g., 'arc', 'saga', 'island'
    scope_value: str # e.g., 'romance-dawn'

class RefineJobDTO(BaseModel):
    entities_patch: Dict[str, Any]

# Background tasks
async def background_scraping_task(job_id: str, scope_type: str, scope_value: str):
    logger.info(f"Iniciando raspagem de dados em segundo plano para o Job {job_id}")
    database.update_job(job_id, {"status": "collecting"}, "Iniciou fase de coleta/scraping.")
    
    try:
        result = await scraper.run_coleta(scope_type, scope_value)
        
        database.update_job(job_id, {
            "status": "preview_ready",
            "sources": result["sources"],
            "extracted_entities": result["extracted_entities"],
            "normalized_entities": result["normalized_entities"],
            "preview_summary": result["preview_summary"]
        }, "Coleta finalizada. Dados prontos em Staging para Preview.")
        logger.info(f"Job {job_id} finalizado com status preview_ready.")
        
    except Exception as e:
        logger.error(f"Erro no scraping para o Job {job_id}: {e}")
        database.update_job(job_id, {"status": "failed"}, f"Erro durante coleta: {str(e)}")

async def background_publishing_task(job_id: str):
    logger.info(f"Iniciando publicação dos dados na API Core para o Job {job_id}")
    database.update_job(job_id, {"status": "publishing"}, "Iniciou fase de publicação na API Core.")
    
    job = database.get_job(job_id)
    if not job:
        return
        
    try:
        publish_results = await publisher.publish_job_payload(job["normalized_entities"])
        
        database.update_job(job_id, {
            "status": "completed",
            "publish_result": publish_results
        }, f"Publicação concluída com sucesso: {publish_results}")
        logger.info(f"Job {job_id} publicado com sucesso.")
        
    except Exception as e:
        logger.error(f"Erro na publicação para o Job {job_id}: {e}")
        database.update_job(job_id, {
            "status": "failed",
            "publish_result": {"error": str(e)}
        }, f"Falha na publicação: {str(e)}")

# REST Endpoints
@app.post("/pipeline-jobs", status_code=status.HTTP_201_CREATED)
def create_pipeline_job(dto: CreateJobDTO, background_tasks: BackgroundTasks):
    job = database.create_job(dto.scope_type, dto.scope_value)
    background_tasks.add_task(background_scraping_task, job["id"], dto.scope_type, dto.scope_value)
    return job

@app.get("/pipeline-jobs")
def get_all_jobs():
    return database.list_jobs()

@app.get("/pipeline-jobs/{job_id}")
def get_job_by_id(job_id: str):
    job = database.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado.")
    return job

@app.get("/pipeline-jobs/{job_id}/preview")
def get_job_preview(job_id: str):
    job = database.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado.")
    return {
        "job_id": job["id"],
        "status": job["status"],
        "scope_type": job["scope_type"],
        "scope_value": job["scope_value"],
        "preview_summary": job["preview_summary"],
        "sources": job["sources"],
        "normalized_entities": job["normalized_entities"]
    }

@app.post("/pipeline-jobs/{job_id}/refine")
def refine_job(job_id: str, dto: RefineJobDTO):
    job = database.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado.")
        
    if job["status"] not in ["preview_ready", "refined"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Não é possível refinar um job no estado atual: {job['status']}."
        )
        
    # Apply path/updates to normalized_entities
    normalized = job["normalized_entities"]
    for key, value in dto.entities_patch.items():
        if key in normalized:
            normalized[key] = value
            
    updated_job = database.update_job(
        job_id, 
        {"status": "refined", "normalized_entities": normalized}, 
        f"Dados refinados manualmente pelo operador."
    )
    return updated_job

@app.post("/pipeline-jobs/{job_id}/approve")
def approve_job(job_id: str):
    job = database.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado.")
        
    if job["status"] not in ["preview_ready", "refined"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Apenas jobs prontos ou refinados podem ser aprovados. Estado atual: {job['status']}."
        )
        
    updated_job = database.update_job(
        job_id, 
        {"status": "approved"}, 
        "Job aprovado pelo operador. Pronto para publicação."
    )
    return updated_job

@app.post("/pipeline-jobs/{job_id}/publish")
def publish_job(job_id: str, background_tasks: BackgroundTasks):
    job = database.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado.")
        
    if job["status"] != "approved":
        raise HTTPException(
            status_code=400, 
            detail=f"Apenas jobs aprovados podem ser publicados. Estado atual: {job['status']}."
        )
        
    background_tasks.add_task(background_publishing_task, job_id)
    return {"message": "Processo de publicação disparado em segundo plano.", "job_id": job_id}
