#!/bin/bash

echo "Resetando ambiente One Piece (Write Model + CDC Read Model)..."

# 1. Limpa o Docker (derruba e apaga volumes para recriar os bancos do zero)
docker compose down -v
# 2. Sobe os containers novamente
docker compose up -d

echo "Aguardando Kafka Connect (Debezium) estar 100% pronto..."
until [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8083/connectors)" -eq 200 ]; do
  sleep 2
done

# 3. Executa as migrations e seeds no banco de escrita (Write DB)
# IMPORTANTE: Rodamos isso ANTES de registrar o conector. 
# Assim, o Debezium iniciará fazendo um Snapshot inicial consistente de todas as tabelas já povoadas.
echo "Executando migrations e seeds no banco de escrita..."
cd api
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
cd ..

# Ajusta as sequences do Postgres que saem de sincronia devido aos IDs fixos dos seeds
echo "Ajustando sequences do Postgres..."
docker exec web-project-postgres_db-1 psql -U postgres -d grand_line_db -c "
  SELECT setval('sagas_id_seq', COALESCE((SELECT MAX(id) FROM sagas), 1));
  SELECT setval('arcs_id_seq', COALESCE((SELECT MAX(id) FROM arcs), 1));
  SELECT setval('islands_id_seq', COALESCE((SELECT MAX(id) FROM islands), 1));
  SELECT setval('arc_islands_id_seq', COALESCE((SELECT MAX(id) FROM arc_islands), 1));
  SELECT setval('characters_id_seq', COALESCE((SELECT MAX(id) FROM characters), 1));
  SELECT setval('character_versions_id_seq', COALESCE((SELECT MAX(id) FROM character_versions), 1));
  SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 1));
  SELECT setval('event_participants_id_seq', COALESCE((SELECT MAX(id) FROM event_participants), 1));
"

# 4. Registra o conector do Debezium
echo "Registrando conector Debezium para PostgreSQL..."
curl -i -X POST -H "Content-Type: application/json" http://localhost:8083/connectors/ -d @connector.json

echo ""
echo "✅ TUDO PRONTO! O Read DB foi criado e o Debezium já está espelhando os dados."
echo "👉 Agora rode: npm run start:dev"
