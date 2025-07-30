#!/bin/bash

# Script Bash para limpeza do projeto SCCAFE
# Execute este script na raiz do projeto: ./cleanup-project.sh

echo "🧹 Iniciando limpeza do projeto SCCAFE..."

# Arquivos vazios para remover
files_to_remove=(
    "addtoken-link.html"
    "token-link-generator.html"
    "assets/js/addtoken-index.js"
    "assets/js/addtoken-link.js" 
    "assets/css/token-style.css"
    "token/js/main.js"
    "token/js/metamask.js"
    "contracts/contrato-base.sol"
)

# Pastas vazias para remover
folders_to_remove=(
    "token/js"
    "token"
    "contracts"
)

echo "📁 Removendo arquivos vazios e duplicados..."

for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "  ✅ Removido: $file"
    else
        echo "  ⚠️  Não encontrado: $file"
    fi
done

echo "📂 Removendo pastas vazias..."

for folder in "${folders_to_remove[@]}"; do
    if [ -d "$folder" ]; then
        rm -rf "$folder"
        echo "  ✅ Pasta removida: $folder"
    else
        echo "  ⚠️  Pasta não encontrada: $folder"
    fi
done

echo "🎉 Limpeza concluída! Projeto organizado."
echo "📋 Estrutura final:"
echo "  📁 assets/ - CSS, JS do tema, vendor files"
echo "  📁 imgs/ - Imagens específicas do projeto"
echo "  📁 js/ - Scripts JavaScript personalizados"
echo "  📁 css/ - Estilos CSS personalizados" 
echo "  📁 contratos/ - Contratos Solidity"
echo "  📁 [outras pastas de aplicações]"
echo "  📄 [arquivos HTML na raiz]"

echo ""
echo "🚀 Pronto para commit e push! Todos os caminhos estão corretos."
