# 🧹 LIMPEZA MANUAL DO PROJETO SCCAFE

Se preferir fazer a limpeza manualmente, remova os seguintes arquivos e pastas:

## Arquivos Vazios para Remover:
- [ ] `addtoken-link.html` (vazio)
- [ ] `token-link-generator.html` (vazio)
- [ ] `assets/js/addtoken-index.js` (vazio)
- [ ] `assets/js/addtoken-link.js` (vazio)
- [ ] `assets/css/token-style.css` (duplicado de `css/token.css`)
- [ ] `token/js/main.js` (vazio)
- [ ] `token/js/metamask.js` (vazio)
- [ ] `contracts/contrato-base.sol` (vazio, duplicata de `contratos/contrato-base.sol`)

## Pastas Vazias para Remover:
- [ ] `token/js/` (pasta vazia)
- [ ] `token/` (pasta vazia após remoção dos arquivos)
- [ ] `contracts/` (pasta com arquivo vazio, duplicata de `contratos/`)

## Como fazer:

### Opção 1: Script PowerShell (Windows)
```powershell
./cleanup-project.ps1
```

### Opção 2: Script Bash (Linux/Mac)
```bash
chmod +x cleanup-project.sh
./cleanup-project.sh
```

### Opção 3: Manual
Usando o explorador de arquivos ou terminal, delete os arquivos e pastas listados acima.

---

## ✅ Após a limpeza, sua estrutura final será:

```
/cafe
├── assets/              # Bibliotecas, CSS do tema, vendor files
├── imgs/               # Imagens específicas do projeto  
├── js/                 # Scripts JavaScript personalizados
├── css/                # Estilos CSS personalizados
├── contratos/          # Contratos Solidity
├── carteira-simulador/ # Aplicação independente
├── token-calculadora/  # Aplicação independente
├── usdt-parado/        # Aplicação independente
├── forms/              # Scripts PHP
├── .vscode/            # Configurações VS Code
├── index.html          # Página principal
├── add-index.html      # Sistema de criação de tokens
├── add-token.html      # Adicionar token ao MetaMask
├── link-index.html     # Gerador de links para tokens
├── link-link.html      # Página de adição via link
├── link-generator.html # Gerador de links
├── service-details.html# Detalhes de serviços
├── starter-page.html   # Página inicial
├── header.html         # Cabeçalho compartilhado
├── footer.html         # Rodapé compartilhado
└── Readme.txt          # Documentação
```

## 🚀 Depois da limpeza:

1. Faça commit das mudanças:
   ```bash
   git add .
   git commit -m "🧹 Organização e limpeza completa do projeto - caminhos corrigidos"
   ```

2. Faça push:
   ```bash
   git push
   ```

3. Teste se tudo está funcionando corretamente!

---

**Todas as correções de caminhos já foram aplicadas e o projeto está pronto para uso!** 🎉
