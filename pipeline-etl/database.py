import sqlite3
import json
import uuid
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "pipeline.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            scope_type TEXT NOT NULL,
            scope_value TEXT NOT NULL,
            status TEXT NOT NULL,
            sources TEXT,
            raw_payload_refs TEXT,
            extracted_entities TEXT,
            normalized_entities TEXT,
            preview_summary TEXT,
            review_decision TEXT,
            publish_result TEXT,
            audit_log TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def create_job(scope_type: str, scope_value: str) -> dict:
    job_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"
    
    job = {
        "id": job_id,
        "scope_type": scope_type,
        "scope_value": scope_value,
        "status": "created",
        "sources": json.dumps([]),
        "raw_payload_refs": json.dumps({}),
        "extracted_entities": json.dumps({}),
        "normalized_entities": json.dumps({}),
        "preview_summary": json.dumps({}),
        "review_decision": json.dumps({}),
        "publish_result": json.dumps({}),
        "audit_log": json.dumps([f"{now} - Job criado para o escopo '{scope_type}:{scope_value}'."]),
        "created_at": now,
        "updated_at": now
    }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO jobs (
            id, scope_type, scope_value, status, sources, raw_payload_refs, 
            extracted_entities, normalized_entities, preview_summary, 
            review_decision, publish_result, audit_log, created_at, updated_at
        ) VALUES (
            :id, :scope_type, :scope_value, :status, :sources, :raw_payload_refs,
            :extracted_entities, :normalized_entities, :preview_summary,
            :review_decision, :publish_result, :audit_log, :created_at, :updated_at
        )
    """, job)
    conn.commit()
    conn.close()
    return get_job(job_id)

def get_job(job_id: str) -> dict | None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    
    # Convert Row to dict and deserialize JSON strings
    job = dict(row)
    for field in [
        "sources", "raw_payload_refs", "extracted_entities", 
        "normalized_entities", "preview_summary", "review_decision", 
        "publish_result", "audit_log"
    ]:
        if job[field]:
            try:
                job[field] = json.loads(job[field])
            except Exception:
                job[field] = [] if field in ["sources", "audit_log"] else {}
    return job

def update_job(job_id: str, updates: dict, log_message: str = None) -> dict | None:
    job = get_job(job_id)
    if not job:
        return None
    
    now = datetime.utcnow().isoformat() + "Z"
    
    # If there is a log message, append it to the audit log
    audit_log = job.get("audit_log", [])
    if log_message:
        audit_log.append(f"{now} - {log_message}")
    
    updates["updated_at"] = now
    updates["audit_log"] = json.dumps(audit_log)
    
    # Serialize dict/list fields to JSON strings
    for field in [
        "sources", "raw_payload_refs", "extracted_entities", 
        "normalized_entities", "preview_summary", "review_decision", 
        "publish_result"
    ]:
        if field in updates and not isinstance(updates[field], str):
            updates[field] = json.dumps(updates[field])
            
    # Build dynamic update query
    set_clause = ", ".join([f"{k} = :{k}" for k in updates.keys()])
    updates["id"] = job_id
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"UPDATE jobs SET {set_clause} WHERE id = :id", updates)
    conn.commit()
    conn.close()
    return get_job(job_id)

def list_jobs() -> list[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, scope_type, scope_value, status, created_at FROM jobs ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
