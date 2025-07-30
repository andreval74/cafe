# Organização do Projeto SCCAFE

## Estrutura Final Organizada

### Arquivos HTML Principais (Raiz)
- `index.html` - Página principal ✅
- `add-index.html` - Sistema de criação de tokens ✅
- `add-token.html` - Adicionar token ao MetaMask ✅
- `link-index.html` - Gerador de links para tokens ✅
- `link-link.html` - Página de adição de token via link ✅
- `link-generator.html` - Gerador de links ✅
- `service-details.html` - Detalhes de serviços ✅
- `starter-page.html` - Página inicial ✅
- `header.html` - Cabeçalho compartilhado ✅
- `footer.html` - Rodapé compartilhado ✅

### Estrutura de Pastas
```
/
├── assets/
│   ├── css/
│   │   ├── main.css - Estilos principais do Bootstrap theme
│   │   └── token-style.css - Estilos específicos de tokens (DUPLICADO - usar css/token.css)
│   ├── img/ - Imagens dos assets do tema
│   ├── js/
│   │   ├── include.js - Script de inclusão de header/footer
│   │   ├── main.js - Scripts principais do tema
│   │   ├── addtoken-index.js - VAZIO (remover)
│   │   └── addtoken-link.js - VAZIO (remover)
│   └── vendor/ - Bibliotecas third-party (Bootstrap, AOS, etc.)
├── imgs/ - Imagens específicas do projeto
├── js/ - Scripts JavaScript personalizados
├── css/
│   └── token.css - Estilos para páginas de tokens
├── contratos/
│   └── contrato-base.sol - Contrato Solidity base
├── carteira-simulador/ - Aplicação independente
├── token-calculadora/ - Aplicação independente
├── usdt-parado/ - Aplicação independente
└── forms/ - Scripts PHP
```

### Correções Aplicadas
1. ✅ Corrigidos caminhos de ícones (`assets/img/` → `imgs/`)
2. ✅ Corrigidos caminhos de scripts JS
3. ✅ Organizados arquivos CSS
4. ✅ Header e footer atualizados com caminhos corretos

### Arquivos a Remover (vazios/duplicados)
- `addtoken-link.html` - VAZIO
- `token-link-generator.html` - VAZIO
- `assets/js/addtoken-index.js` - VAZIO
- `assets/js/addtoken-link.js` - VAZIO
- `assets/css/token-style.css` - DUPLICADO
- `token/` - Pasta com arquivos vazios
- `contracts/` - Pasta com arquivo vazio

### Scripts JS Organizados
Todos os scripts personalizados estão na pasta `js/` raiz:
- `add-index.js` - Sistema de criação de tokens
- `add-token.js` - Adicionar token ao MetaMask
- `link-index.js` - Gerador de links
- `token-link-generator.js` - Gerador de links de tokens
- `addtoken-link.js` - Script para página de link
- `metamask.js` - Integração com MetaMask
- E outros scripts específicos...

## Status da Organização
✅ **CONCLUÍDO** - Projeto organizado e caminhos corrigidos
🚀 **PRONTO PARA DESENVOLVIMENTO**
