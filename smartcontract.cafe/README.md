# SmartContract.Cafe 🚀☕

**Plataforma de criação de tokens ERC-20 com tema de café**

## 📋 Visão Geral

O SmartContract.Cafe é uma plataforma inspirada em CreateMyToken.com e 20lab.app, oferecendo duas modalidades:

- **Modo Simples**: Criação gratuita em 3 passos (60 segundos) com sufixo "cafe"
- **Modo Avançado**: 15+ recursos premium com contratos personalizados

## 🎯 Status Atual

### ✅ Implementado

#### 🏗️ Arquitetura
- [x] Estrutura modular de diretórios
- [x] Separação clara HTML/CSS/JS
- [x] Design system com tema café
- [x] Arquitetura responsiva

#### 🎨 Interface
- [x] Landing page com seleção de modos
- [x] Interface do modo simples (3 steps)
- [x] Sistema de progresso visual
- [x] Design responsivo mobile-first
- [x] Tema café com paleta de cores

#### 🔧 Funcionalidades Core
- [x] Template OpenZeppelin ERC-20 básico
- [x] Validação de formulário em tempo real
- [x] Sistema de notificações
- [x] Gestão de estado do formulário
- [x] Preview do token com sufixo "cafe"
- [x] Simulação completa de deploy

#### 🌐 Web3 Integration
- [x] Web3Manager para conexão de carteira
- [x] Suporte multi-rede (Ethereum, Polygon, BSC)
- [x] Detecção de MetaMask
- [x] Gestão de estado de conexão

### 🔄 Em Desenvolvimento

- [ ] Compilação real de contratos Solidity
- [ ] Deploy real na blockchain
- [ ] Verificação automática no block explorer
- [ ] Integração com redes testnet
- [ ] Modo avançado (4 steps, 15+ recursos)
- [ ] Templates avançados (deflationary, reflection, etc.)
- [ ] Sistema de pagamento para versão premium

## 📁 Estrutura do Projeto

```
smartcontract.cafe/
├── public/                 # Páginas HTML
│   ├── index.html         # Landing page
│   ├── simple.html        # Modo simples
│   └── demo.html          # Demonstração funcional
├── assets/
│   ├── css/
│   │   ├── main.css       # Design system principal
│   │   └── simple-mode.css # Estilos do modo simples
│   └── js/
│       ├── core/
│       │   └── web3-manager.js     # Gestão Web3
│       ├── templates/
│       │   └── basic-token.js      # Template OpenZeppelin
│       └── features/
│           └── simple-interface.js # Interface modo simples
```

## 🚀 Como Testar

### 1. Demo Funcional
```bash
# Abra no navegador:
public/demo.html
```

Recursos da demo:
- ✅ Teste de notificações
- ✅ Validação de formulário
- ✅ Preview do token
- ✅ Status dos componentes

### 2. Modo Simples Completo
```bash
# Abra no navegador:
public/simple.html
```

Funcionalidades:
- 🔗 Conexão de carteira (simulada)
- 📝 Formulário com validação
- 👁️ Preview em tempo real
- 🚀 Simulação de deploy
- 📱 Interface responsiva

### 3. Landing Page
```bash
# Abra no navegador:
public/index.html
```

## 🎨 Design System

### Paleta de Cores (Tema Café)
```css
--coffee-light: #F7F3F0   /* Creme claro */
--coffee-medium: #D2691E  /* Laranja chocolate */
--coffee-dark: #8B4513    /* Marrom café */
--coffee-beans: #3E2723   /* Grãos escuros */
```

### Componentes
- Cartões de informação com gradientes
- Formulários com validação visual
- Barras de progresso animadas
- Notificações flutuantes
- Botões com hover effects

## 🔧 Componentes Técnicos

### Web3Manager
```javascript
// Gestão completa de carteiras Web3
const web3Manager = new Web3Manager();
await web3Manager.connectWallet();
```

### BasicTokenTemplate
```javascript
// Template OpenZeppelin com sufixo "cafe"
const template = new BasicTokenTemplate();
const code = template.generateCode({
    tokenName: "Meu Token",
    tokenSymbol: "MTK",
    totalSupply: 1000000
});
```

### SimpleTokenInterface
```javascript
// Interface completa do modo simples
const interface = new SimpleTokenInterface();
// Gestão automática de steps, validação e deploy
```

## 🌟 Recursos Únicos

### 1. Sufixo "cafe" Gratuito
- Tokens gratuitos recebem sufixo automático
- Diferenciação clara entre free/premium
- Branding consistente da plataforma

### 2. Validação Inteligente
- Validação em tempo real
- Feedback visual imediato
- Suporte a diferentes formatos

### 3. Template OpenZeppelin
- Contratos auditados e seguros
- Padrão da indústria
- Função de mint adicional
- Metadados de criação

### 4. Interface Progressiva
- 3 steps claros e intuitivos
- Barra de progresso visual
- Navegação fluida entre etapas

## 🎯 Estratégia Competitiva

### vs CreateMyToken.com
- ✅ Interface igualmente simples (3 vs 1 step)
- ✅ Deploy gratuito com branding
- ✅ Validação mais robusta
- ✅ Design mais moderno

### vs 20lab.app
- ✅ Modo simples gratuito
- ✅ OpenZeppelin como base
- 🔄 Modo avançado em desenvolvimento
- 🔄 Recursos premium planejados

## 📱 Responsividade

- **Desktop**: Layout em grid com sidebar
- **Tablet**: Adaptação automática do grid
- **Mobile**: Layout vertical otimizado
- **Touch**: Botões e elementos touch-friendly

## 🔐 Segurança

- Templates baseados em OpenZeppelin
- Validação rigorosa de inputs
- Sanitização de nomes de contrato
- Verificação automática planejada

## 🚀 Próximos Passos

### Fase 1: Core Funcional
1. Implementar compilação Solidity real
2. Deploy funcional em testnet
3. Verificação automática
4. Testes de integração

### Fase 2: Modo Avançado
1. Interface de 4 steps
2. 15+ recursos configuráveis
3. Templates especializados
4. Sistema de pagamento

### Fase 3: Ecossistema
1. Dashboard de tokens criados
2. Analytics e métricas
3. Integração com DEXs
4. API para desenvolvedores

## 📞 Suporte

- **Telegram**: @smartcontract_cafe
- **Email**: suporte@smartcontract.cafe
- **Documentação**: [Em desenvolvimento]

---

**Criado com ☕ pela equipe SmartContract.Cafe**
