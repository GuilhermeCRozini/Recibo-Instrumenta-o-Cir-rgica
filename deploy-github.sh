#!/bin/bash

# Script para fazer upload do Gerador de Recibos para o GitHub
# Uso: ./deploy-github.sh

echo "🚀 Gerador de Recibos - Deploy para GitHub"
echo "=========================================="
echo ""

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não encontrado!"
    echo "📥 Instale em: https://cli.github.com/"
    echo ""
    echo "Ou use o método manual:"
    echo "1. Crie um repositório privado em https://github.com/new"
    echo "2. Execute:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git branch -M main"
    echo "   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git"
    echo "   git push -u origin main"
    exit 1
fi

# Solicitar nome do repositório
echo "Digite o nome do repositório (ex: gerador-recibos):"
read -r REPO_NAME

if [ -z "$REPO_NAME" ]; then
    echo "❌ Nome do repositório não pode ser vazio!"
    exit 1
fi

echo ""
echo "📦 Criando repositório privado: $REPO_NAME"
echo ""

# Inicializar git
git init

# Adicionar arquivos
git add index.html style.css script.js README.md .gitignore

# Commit inicial
git commit -m "Initial commit: Gerador de Recibos Médicos"

# Criar e fazer push do repositório
gh repo create "$REPO_NAME" --private --source=. --push

echo ""
echo "✅ Repositório criado com sucesso!"
echo "🔒 Repositório configurado como PRIVADO"
echo ""
echo "📍 Acesse em: https://github.com/$(gh api user -q .login)/$REPO_NAME"
echo ""
echo "Para habilitar GitHub Pages:"
echo "1. Vá em Settings > Pages"
echo "2. Selecione branch 'main' e pasta '/ (root)'"
echo "3. Clique em 'Save'"
echo ""
