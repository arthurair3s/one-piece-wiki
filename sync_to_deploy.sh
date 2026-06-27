#!/bin/bash

# Caminhos dos repositórios de destino
API_DEST="../one-piece-web/one-piece-web-api"
APP_DEST="../one-piece-web/one-piece-web-app"

# Pega a mensagem de commit passada como argumento ou usa uma padrão
COMMIT_MSG="${1:-sync: atualizacao automatica do monorepo}"

echo "🔄 Iniciando sincronização para deploy..."

# 1. Valida se os diretórios de destino existem
if [ ! -d "$API_DEST" ] || [ ! -d "$APP_DEST" ]; then
    echo "❌ Erro: Diretórios de destino não encontrados!"
    echo "Certifique-se de que $API_DEST e $APP_DEST existem."
    exit 1
fi

# 2. Sincroniza a API (Backend)
echo "📂 Sincronizando API (Backend)..."
rsync -av --delete \
  --exclude="node_modules" \
  --exclude="dist" \
  --exclude=".git" \
  --exclude=".env" \
  --exclude="tsconfig.tsbuildinfo" \
  api/ "$API_DEST/"

# 3. Sincroniza o APP (Frontend)
echo "📂 Sincronizando APP (Frontend)..."
rsync -av --delete \
  --exclude="node_modules" \
  --exclude=".next" \
  --exclude=".git" \
  --exclude=".env" \
  --exclude="tsconfig.tsbuildinfo" \
  app/ "$APP_DEST/"

# 4. Envia alterações do Backend (API) para o GitHub
echo "🚀 Enviando atualizações do Backend..."
cd "$API_DEST" || exit
git add .
if ! git diff-index --quiet HEAD --; then
    git commit -m "$COMMIT_MSG"
    git push origin main || git push origin master
    echo "✅ API atualizada e enviada com sucesso!"
else
    echo "ℹ️ Nenhuma alteração encontrada no Backend."
fi

# Voltar para a raiz do monorepo
cd - > /dev/null || exit

# 5. Envia alterações do Frontend (APP) para o GitHub
echo "🚀 Enviando atualizações do Frontend..."
cd "$APP_DEST" || exit
git add .a
if ! git diff-index --quiet HEAD --; then
    git commit -m "$COMMIT_MSG"
    git push origin main || git push origin master
    echo "✅ APP atualizado e enviado com sucesso!"
else
    echo "ℹ️ Nenhuma alteração encontrada no Frontend."
fi

# Voltar para a raiz
cd - > /dev/null || exit

echo "🏁 Sincronização concluída!"
