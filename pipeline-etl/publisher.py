import httpx
import pg8000.dbapi
import logging
import os

logger = logging.getLogger("publisher")

def load_env():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    paths = [
        os.path.join(base_dir, ".env"),
        os.path.join(base_dir, "..", ".env"),
        os.path.join(base_dir, "..", "api", ".env")
    ]
    for path in paths:
        if os.path.exists(path):
            with open(path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        val = v.strip().strip("'\"")
                        os.environ.setdefault(k.strip(), val)

load_env()

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:3000/api")

PG_CONFIG = {
    "host": os.environ.get("DB_HOST", "127.0.0.1"),
    "port": int(os.environ.get("DB_PORT", "5432")),
    "user": os.environ.get("DB_USERNAME", "postgres"),
    "password": os.environ.get("DB_PASSWORD", "postgres"),
    "database": os.environ.get("DB_DATABASE", "grand_line_db")
}

def get_pg_connection():
    return pg8000.dbapi.connect(
        host=PG_CONFIG["host"],
        port=PG_CONFIG["port"],
        user=PG_CONFIG["user"],
        password=PG_CONFIG["password"],
        database=PG_CONFIG["database"]
    )

async def authenticate() -> str:
    credentials_list = [
        {"email": "admin@admin.com", "password": "admin123"},
        {"email": "admin@grandline.com", "password": "admin123"}
    ]
    
    last_err = None
    async with httpx.AsyncClient() as client:
        for creds in credentials_list:
            try:
                url = f"{API_BASE_URL}/auth/login"
                logger.info(f"Tentando login com {creds['email']}...")
                response = await client.post(url, json=creds)
                if response.status_code == 201:
                    data = response.json()
                    token = data.get("accessToken") or data.get("access_token")
                    if token:
                        logger.info("Login efetuado com sucesso!")
                        return token
            except Exception as e:
                last_err = e
                
        raise Exception(f"Falha na autenticação da API Core. Último erro: {last_err}")

async def publish_saga(client: httpx.AsyncClient, headers: dict, saga_data: dict) -> int:
    res = await client.get(f"{API_BASE_URL}/sagas?limit=10000", headers=headers)
    res.raise_for_status()
    sagas_response = res.json()
    sagas = sagas_response.get("data", []) if isinstance(sagas_response, dict) else sagas_response
    
    for s in sagas:
        if s["name"].lower() == saga_data["name"].lower() or s["order"] == saga_data["order"]:
            logger.info(f"Saga '{saga_data['name']}' ou ordem {saga_data['order']} já existe (ID: {s['id']}).")
            return s["id"]
            
    logger.info(f"Criando saga '{saga_data['name']}'...")
    res = await client.post(f"{API_BASE_URL}/sagas", json=saga_data, headers=headers)
    res.raise_for_status()
    created = res.json()
    return created["id"]

async def publish_arc(client: httpx.AsyncClient, headers: dict, arc_data: dict) -> int:
    res = await client.get(f"{API_BASE_URL}/arcs?limit=10000", headers=headers)
    res.raise_for_status()
    arcs_response = res.json()
    arcs = arcs_response.get("data", []) if isinstance(arcs_response, dict) else arcs_response
    
    for a in arcs:
        if a["saga_id"] == arc_data["saga_id"] and (a["name"].lower() == arc_data["name"].lower() or a["order"] == arc_data["order"]):
            logger.info(f"Arco '{arc_data['name']}' ou ordem {arc_data['order']} no saga ID {arc_data['saga_id']} já existe (ID: {a['id']}).")
            return a["id"]
            
    logger.info(f"Criando arco '{arc_data['name']}'...")
    res = await client.post(f"{API_BASE_URL}/arcs", json=arc_data, headers=headers)
    res.raise_for_status()
    created = res.json()
    return created["id"]

async def publish_island(client: httpx.AsyncClient, headers: dict, island_data: dict, arc_id: int) -> int:
    res = await client.get(f"{API_BASE_URL}/islands?limit=10000", headers=headers)
    res.raise_for_status()
    islands_response = res.json()
    islands = islands_response.get("data", []) if isinstance(islands_response, dict) else islands_response
    
    island_id = None
    for isl in islands:
        if isl["name"].lower() == island_data["name"].lower():
            logger.info(f"Ilha '{island_data['name']}' já existe (ID: {isl['id']}).")
            island_id = isl["id"]
            break
            
    if not island_id:
        payload = {
            "name": island_data["name"],
            "description": island_data["description"],
            "coordinate_x": island_data["coordinate_x"],
            "coordinate_y": island_data["coordinate_y"],
            "coordinate_z": island_data["coordinate_z"],
            "model_url": island_data["model_url"],
            "thumbnail_url": island_data["thumbnail_url"],
            "is_active": island_data["is_active"],
            "arc_ids": [{"arc_id": arc_id, "order": 1}]
        }
        logger.info(f"Criando ilha '{island_data['name']}'...")
        try:
            res = await client.post(f"{API_BASE_URL}/islands", json=payload, headers=headers)
            res.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.error(f"Erro detalhado ao criar ilha: {e.response.text}")
            raise Exception(f"Erro ao criar ilha: {e.response.text}")
        created = res.json()
        island_id = created["id"]
    else:
        payload = {
            "description": island_data["description"],
            "coordinate_x": island_data["coordinate_x"],
            "coordinate_y": island_data["coordinate_y"],
            "coordinate_z": island_data["coordinate_z"],
            "model_url": island_data["model_url"],
            "thumbnail_url": island_data["thumbnail_url"],
            "arc_ids": [{"arc_id": arc_id, "order": 1}]
        }
        logger.info(f"Assegurando vínculo da ilha '{island_data['name']}' com o arco ID {arc_id} e atualizando dados...")
        try:
            res = await client.patch(f"{API_BASE_URL}/islands/{island_id}", json=payload, headers=headers)
            res.raise_for_status()
        except Exception as e:
            logger.warning(f"Aviso ao atualizar/vincular arco à ilha: {e}.")
            
    return island_id

async def publish_character(client: httpx.AsyncClient, headers: dict, char_data: dict) -> int:
    res = await client.get(f"{API_BASE_URL}/characters?limit=10000", headers=headers)
    res.raise_for_status()
    chars_response = res.json()
    chars = chars_response.get("rows", []) if isinstance(chars_response, dict) else chars_response
    
    for c in chars:
        if c["slug"] == char_data["slug"]:
            logger.info(f"Personagem '{char_data['name']}' já existe (ID: {c['id']}).")
            return c["id"]
            
    logger.info(f"Criando personagem '{char_data['name']}'...")
    res = await client.post(f"{API_BASE_URL}/characters", json=char_data, headers=headers)
    res.raise_for_status()
    created = res.json()
    return created["id"]

async def publish_character_version(client: httpx.AsyncClient, headers: dict, version_data: dict, character_id: int, arc_id: int) -> int:
    res = await client.get(f"{API_BASE_URL}/character-versions?limit=10000", headers=headers)
    res.raise_for_status()
    versions_response = res.json()
    versions = versions_response.get("rows", []) if isinstance(versions_response, dict) else versions_response
    
    for v in versions:
        if v["character_id"] == character_id and v["alias"].lower() == version_data["alias"].lower():
            logger.info(f"Versão '{version_data['alias']}' para o personagem ID {character_id} já existe (ID: {v['id']}).")
            return v["id"]
            
    payload = {
        "character_id": character_id,
        "arc_ids": [arc_id],
        "alias": version_data["alias"],
        "epithet": version_data["epithet"],
        "bounty": version_data["bounty"],
        "status": version_data["status"],
        "image_url": version_data["image_url"],
        "description": version_data["description"]
    }
    logger.info(f"Criando versão '{version_data['alias']}' do personagem...")
    res = await client.post(f"{API_BASE_URL}/character-versions", json=payload, headers=headers)
    res.raise_for_status()
    created = res.json()
    return created["id"]

def resolve_arc_island_id(arc_id: int, island_id: int) -> int:
    conn = get_pg_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM arc_islands WHERE arc_id = %s AND island_id = %s AND "deletedAt" IS NULL', (arc_id, island_id))
        row = cursor.fetchone()
        if row:
            return row[0]
        raise Exception(f"Pivot arc_island não encontrado para arc_id={arc_id} e island_id={island_id}")
    finally:
        conn.close()

async def publish_events(client: httpx.AsyncClient, headers: dict, events: list, arc_id: int, island_map: dict):
    events_payload = []
    
    res = await client.get(f"{API_BASE_URL}/events?limit=10000", headers=headers)
    res.raise_for_status()
    events_response = res.json()
    existing_events = events_response.get("rows", []) if isinstance(events_response, dict) else events_response
    
    for ev in events:
        island_name = ev["island_name"]
        island_id = island_map.get(island_name)
        if not island_id:
            logger.warning(f"Ilha '{island_name}' não mapeada. Pulando evento '{ev['title']}'.")
            continue
            
        arc_island_id = resolve_arc_island_id(arc_id, island_id)
        
        is_duplicate = False
        for ex in existing_events:
            if ex["arc_island_id"] == arc_island_id and ex["order"] == ev["order"]:
                logger.info(f"Evento com ordem {ev['order']} no contexto {arc_island_id} já existe. Pulando.")
                is_duplicate = True
                break
                
        if not is_duplicate:
            events_payload.append({
                "arcIslandId": arc_island_id,
                "title": ev["title"],
                "description": ev["description"],
                "type": ev["type"],
                "order": ev["order"]
            })
            
    if events_payload:
        logger.info(f"Publicando {len(events_payload)} eventos em lote...")
        res = await client.post(f"{API_BASE_URL}/events/bulk", json=events_payload, headers=headers)
        res.raise_for_status()
        logger.info("Eventos publicados com sucesso.")
    else:
        logger.info("Nenhum evento novo para publicar.")

async def publish_job_payload(entities: dict) -> dict:
    token = await authenticate()
    headers = {"Authorization": f"Bearer {token}"}
    
    results = {}
    
    async with httpx.AsyncClient() as client:
        saga_ids = {}
        for saga in entities.get("sagas", []):
            sid = await publish_saga(client, headers, saga)
            saga_ids[saga["name"]] = sid
            
        arc_ids = {}
        for arc in entities.get("arcs", []):
            saga_name = entities["sagas"][0]["name"]
            arc["saga_id"] = saga_ids[saga_name]
            aid = await publish_arc(client, headers, arc)
            arc_ids[arc["name"]] = aid
            
        target_arc_name = entities["arcs"][0]["name"]
        target_arc_id = arc_ids[target_arc_name]
        
        island_ids = {}
        for island in entities.get("islands", []):
            iid = await publish_island(client, headers, island, target_arc_id)
            island_ids[island["name"]] = iid
            
        char_ids = {}
        for char in entities.get("characters", []):
            cid = await publish_character(client, headers, char)
            char_ids[char["slug"]] = cid
            
        version_ids = {}
        for version in entities.get("versions", []):
            char_slug = version["character_slug"]
            char_id = char_ids[char_slug]
            vid = await publish_character_version(client, headers, version, char_id, target_arc_id)
            version_ids[version["alias"]] = vid
            
        await publish_events(client, headers, entities.get("events", []), target_arc_id, island_ids)
        
        results = {
            "sagas_published": len(saga_ids),
            "arcs_published": len(arc_ids),
            "islands_published": len(island_ids),
            "characters_published": len(char_ids),
            "versions_published": len(version_ids),
            "events_published": len(entities.get("events", []))
        }
        
    return results
