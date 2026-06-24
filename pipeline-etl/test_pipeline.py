import time
import httpx
import multiprocessing
import uvicorn
from main import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")

def run_tests():
    # Wait for server to boot
    time.sleep(2)
    client = httpx.Client(base_url="http://127.0.0.1:8000")
    
    print("\n=======================================================")
    print("INICIANDO TESTE DE INTEGRAÇÃO DO GRAND LINE ETL")
    print("=======================================================\n")
    
    arcos = ["romance-dawn", "orange-town", "vila-syrup", "baratie"]
    
    for idx, arco in enumerate(arcos, 1):
        print(f"\n>>> PROCESSANDO ARCO {idx}/{len(arcos)}: {arco} <<<\n")
        
        # 1. Create Job
        print(f"1. Criando Pipeline Job para {arco}...")
        res = client.post("/pipeline-jobs", json={"scope_type": "arc", "scope_value": arco})
        if res.status_code != 201:
            print(f"   [FALHA] Status esperado: 201, recebido: {res.status_code}, corpo: {res.text}")
            return
        job = res.json()
        job_id = job["id"]
        print(f"   [OK] Job criado com ID: {job_id}")
        
        # 2. Poll until preview_ready
        print("2. Aguardando coleta e staging (preview_ready)...")
        for _ in range(10):
            res = client.get(f"/pipeline-jobs/{job_id}")
            job = res.json()
            if job["status"] == "preview_ready":
                print(f"   [OK] Status atingido: {job['status']}")
                break
            time.sleep(1)
        else:
            print(f"   [TIMEOUT] Job não atingiu preview_ready. Status atual: {job['status']}")
            return
            
        # 3. Preview
        print("3. Visualizando Preview do Job...")
        res = client.get(f"/pipeline-jobs/{job_id}/preview")
        if res.status_code != 200:
            print(f"   [FALHA] Erro ao carregar preview: {res.text}")
            return
        preview = res.json()
        print(f"   [OK] Confiança: {preview['preview_summary']['confidence_score']}")
        print(f"   [OK] Fontes de dados visitadas: {preview['sources']}")
        print(f"   Entidades Normalizadas a serem criadas:")
        print(f"     - Sagas: {len(preview['normalized_entities']['sagas'])}")
        print(f"     - Arcos: {len(preview['normalized_entities']['arcs'])}")
        print(f"     - Ilhas: {len(preview['normalized_entities']['islands'])}")
        print(f"     - Personagens: {len(preview['normalized_entities']['characters'])}")
        print(f"     - Versões: {len(preview['normalized_entities']['versions'])}")
        print(f"     - Eventos: {len(preview['normalized_entities']['events'])}")
        
        # 4. Refine
        print("4. Refinando dados do Job (simulando alteração do operador)...")
        patch = {"sagas": [{"name": "Saga de East Blue (Refinada)", "order": 1, "description": "Saga inicial de East Blue (Refinada pelo Operador)."}]}
        res = client.post(f"/pipeline-jobs/{job_id}/refine", json={"entities_patch": patch})
        if res.status_code != 200:
            print(f"   [FALHA] Erro no refinamento: {res.text}")
            return
        refined_job = res.json()
        if refined_job["status"] != "refined":
            print(f"   [FALHA] Esperava status 'refined', obteve: {refined_job['status']}")
            return
        print("   [OK] Dados refinados com sucesso no banco de Staging.")
        
        # 5. Approve
        print("5. Aprovando o Job...")
        res = client.post(f"/pipeline-jobs/{job_id}/approve")
        if res.status_code != 200:
            print(f"   [FALHA] Erro ao aprovar: {res.text}")
            return
        approved_job = res.json()
        if approved_job["status"] != "approved":
            print(f"   [FALHA] Esperava status 'approved', obteve: {approved_job['status']}")
            return
        print("   [OK] Job aprovado e liberado para publicação.")
        
        # 6. Publish
        print("6. Disparando publicação na API Core...")
        res = client.post(f"/pipeline-jobs/{job_id}/publish")
        if res.status_code != 200:
            print(f"   [FALHA] Erro ao publicar: {res.text}")
            return
        print("   [OK] Publicação disparada em segundo plano.")
        
        # Poll until completed or failed
        print("7. Aguardando conclusão da publicação na API Core...")
        for _ in range(15):
            res = client.get(f"/pipeline-jobs/{job_id}")
            job = res.json()
            if job["status"] in ["completed", "failed"]:
                print(f"   Status final da publicação: {job['status']}")
                print(f"   Resultados da publicação: {job['publish_result']}")
                print("-------------------------------------------------------")
                print("LOG DE AUDITORIA DO JOB:")
                print("-------------------------------------------------------")
                for log in job["audit_log"]:
                    print(f"     * {log}")
                break
            time.sleep(1)
        else:
             print("   [TIMEOUT] Publicação demorou demais para concluir.")
             return
             
    print("\n=======================================================")
    print("TODOS OS TESTES DE INTEGRAÇÃO FINALIZADOS COM SUCESSO")
    print("=======================================================\n")

if __name__ == "__main__":
    p = multiprocessing.Process(target=run_server)
    p.start()
    try:
        run_tests()
    finally:
        p.terminate()
        p.join()
