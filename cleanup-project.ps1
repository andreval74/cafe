# Script PowerShell para limpeza do projeto SCCAFE
# Execute este script na raiz do projeto

Write-Host "🧹 Iniciando limpeza do projeto SCCAFE..." -ForegroundColor Green

# Arquivos vazios para remover
$filesToRemove = @(
    "addtoken-link.html",
    "token-link-generator.html",
    "assets/js/addtoken-index.js",
    "assets/js/addtoken-link.js",
    "assets/css/token-style.css",
    "token/js/main.js",
    "token/js/metamask.js",
    "contracts/contrato-base.sol"
)

# Pastas vazias para remover
$foldersToRemove = @(
    "token/js",
    "token",
    "contracts"
)

Write-Host "📁 Removendo arquivos vazios e duplicados..." -ForegroundColor Yellow

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ Removido: $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Não encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host "📂 Removendo pastas vazias..." -ForegroundColor Yellow

foreach ($folder in $foldersToRemove) {
    if (Test-Path $folder) {
        Remove-Item $folder -Recurse -Force
        Write-Host "  ✅ Pasta removida: $folder" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Pasta não encontrada: $folder" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Limpeza concluída! Projeto organizado." -ForegroundColor Green
Write-Host "📋 Estrutura final:" -ForegroundColor Cyan
Write-Host "  📁 assets/ - CSS, JS do tema, vendor files" -ForegroundColor White
Write-Host "  📁 imgs/ - Imagens específicas do projeto" -ForegroundColor White
Write-Host "  📁 js/ - Scripts JavaScript personalizados" -ForegroundColor White
Write-Host "  📁 css/ - Estilos CSS personalizados" -ForegroundColor White
Write-Host "  📁 contratos/ - Contratos Solidity" -ForegroundColor White
Write-Host "  📁 [outras pastas de aplicações]" -ForegroundColor White
Write-Host "  📄 [arquivos HTML na raiz]" -ForegroundColor White

Write-Host "`n🚀 Pronto para commit e push! Todos os caminhos estão corretos." -ForegroundColor Green
