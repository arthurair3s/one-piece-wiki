#!/bin/bash

echo "Resetando ambiente One Piece (Write Model + CDC Read Model)..."

# 1. Limpa o Docker (derruba e apaga volumes para recriar os bancos do zero)
docker compose down -v

# 2. Sobe os containers novamente
docker compose pull
docker compose up -d

echo "Aguardando Kafka Connect (Debezium) estar 100% pronto..."
until [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8083/connectors)" -eq 200 ]; do
  sleep 2
done

# 3. Registra o conector do Debezium
echo "Registrando conector Debezium para PostgreSQL..."
curl -i -X POST -H "Content-Type: application/json" http://localhost:8083/connectors/ -d @connector.json

# 4. Executa as migrations e seeds no banco de escrita
echo "Executando migrations e seeds..."
cd api
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
cd ..

echo ""
echo "✅ TUDO PRONTO! O Read DB foi criado e o Debezium já está espelhando os dados."
echo "👉 Agora rode: npm run start:dev"
