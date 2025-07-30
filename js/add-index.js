import { marcarConcluido, clearErrors, markErrors } from './add-utils.js';
import { salvarContrato, compilarContrato, contratoSource, debugContractState } from './add-contratos-verified.js';
import { deployContrato } from './add-deploy.js';
import { connectMetaMask, listenMetaMask, adicionarTokenMetaMask, montarTokenData, gerarLinkToken, switchOrAddNetwork } from './add-metamask.js';
import { buscarSaltFake, pararBuscaSalt } from './add-salt.js';
import { detectCurrentNetwork, currentNetwork, setupNetworkMonitoring, updateNetworkInfo } from './network-manager.js';
import { showVerificationInterface } from './verification-ui.js';
import { initNetworkCommons } from './network-commons.js';

// Adiciona evento ao botão Conectar MetaMask
const btnConectar = document.getElementById('connect-metamask-btn');
if (btnConectar) {
  btnConectar.addEventListener('click', async () => {
    // Primeiro conecta MetaMask
    await connectMetaMask(inputOwner);
    
    // Depois detecta a rede
    await detectNetworkAfterConnection();
    
    // Inicia monitoramento de mudanças (só após conexão)
    listenMetaMask(inputOwner);
  });
}

// Inicializa apenas o sistema de redes (sem detectar automaticamente)
async function initNetworkSystem() {
  try {
    // Apenas inicializa sistema de redes comum (sem detectar rede)
    await initNetworkCommons();
    console.log('🌐 Sistema de redes carregado, aguardando conexão do usuário...');
  } catch (error) {
    console.log('⚠️ Erro ao inicializar sistema de redes:', error);
  }
}

// Detecta rede somente após conexão explícita do usuário
async function detectNetworkAfterConnection() {
  try {
    await detectCurrentNetwork();
    updateNetworkInfo(); // Usa a nova função para o layout atualizado
    
    // Inicia monitoramento para mudanças de rede
    if (typeof setupNetworkMonitoring === 'function') {
      setupNetworkMonitoring(); // Remove parâmetro desnecessário
    }
  } catch (error) {
    console.log('❌ Erro ao detectar rede:', error);
  }
}

// Listener para evento de deploy concluído
window.addEventListener('contractDeployed', (event) => {
  const deployedInfo = event.detail;
  console.log('📄 Contrato deployado:', deployedInfo);
  
  // Mostra botão de verificação
  const verificationBtn = document.getElementById('btn-verification-info');
  if (verificationBtn) {
    verificationBtn.style.display = 'inline-block';
    verificationBtn.disabled = false;
    verificationBtn.onclick = () => {
      showVerificationInterface(deployedInfo);
    };
  }
});



// Referências a elementos DOM
const steps = document.querySelectorAll('.step-content');
const indicators = document.querySelectorAll('.step');
const summaryBox = document.getElementById('token-summary');
const inputNome = document.getElementById('tokenName');
const inputSymbol = document.getElementById('tokenSymbol');
const inputDecimals = document.getElementById('decimals');
const inputSupply = document.getElementById('totalSupply');
const inputOwner = document.getElementById('ownerAddress');
const inputImage = document.getElementById('tokenImage');
const radioPersonalizado = document.getElementById('contrato-personalizado');
const targetSuffix = document.getElementById('targetSuffix');
const predictedAddress = document.getElementById('predictedAddress');
const saltFound = document.getElementById('saltFound');
const btnSalvarContrato = document.getElementById('btn-salvar-contrato');
const btnCompilar = document.getElementById('btn-compilar-contrato');
const btnDeploy = document.getElementById('btn-deploy-contrato');
const btnVerificationInfo = document.getElementById('btn-verification-info');
const nextStep4 = document.getElementById('next-step-4');
const compileStatus = document.getElementById('compile-status');
const deployStatus = document.getElementById('deploy-status');
const networkDisplay = document.getElementById('networkDisplay');
const networkValue = document.getElementById('networkValue'); // Campo oculto
const networkInfo = document.querySelector('.network-info'); // Container da info de rede
let currentStep = 1;

// Garante que os botões começam desabilitados
if (btnCompilar) btnCompilar.disabled = true;
if (btnDeploy) btnDeploy.disabled = true;

// Inicializa exibição da rede
if (networkDisplay && networkInfo) {
  networkDisplay.textContent = 'Conecte sua carteira';
  networkInfo.style.display = 'none'; // Oculta até conectar
}

// Inicializa campo oculto da rede
if (networkValue) {
  networkValue.value = '';
}

// -------------------- Navegação entre steps --------------------
function showStep(step) {
  steps.forEach((el, idx) => {
    el.classList.toggle('active', idx === (step - 1));
  });
  indicators.forEach((el, idx) => {
    el.classList.toggle('active', idx === (step - 1));
    el.classList.toggle('completed', idx < (step - 1));
  });
  currentStep = step;
}

function nextStep() {
  if (currentStep === 1 && !validateStep1()) return;
  if (currentStep === 2) fillResumo();
  if (currentStep < steps.length) showStep(currentStep + 1);
  if (nextStep4) nextStep4.style.display = "none";
}

function prevStep() {
  if (currentStep > 1) showStep(currentStep - 1);
}

function reiniciarFluxo() {
  document.querySelectorAll('input, select, textarea').forEach(field => {
    if (field.type === "radio" || field.type === "checkbox") field.checked = false;
    else field.value = "";
  });
  inputDecimals.value = '18';
  document.getElementById('connect-metamask-btn').style.display = "";
  document.getElementById('connected-wallet-info').style.display = "none";
  inputOwner.readOnly = true;
  
  // Reinicializa exibição da rede
  if (networkDisplay && networkInfo) {
    networkDisplay.textContent = 'Conecte sua carteira';
    networkInfo.style.display = 'none';
  }
  if (networkValue) {
    networkValue.value = '';
  }
  
  showStep(1);
}

// -------------------- Validação Step 1 --------------------
function validateStep1() {
  let ok = true;
  const fields = [inputNome, inputSymbol, inputDecimals, inputSupply, inputOwner];
  clearErrors(fields);
  fields.forEach(field => {
    if (!field.value) ok = false;
  });
  if (!ok) markErrors(fields);
  return ok;
}

// -------------------- Resumo Step --------------------
function fillResumo() {
  let ownerChecksum = inputOwner.value;
  try {
    if (window.ethers && window.ethers.utils) {
      ownerChecksum = window.ethers.utils.getAddress(inputOwner.value);
    }
  } catch (e) {
    // Se não conseguir converter, mantém o valor original
  }
  summaryBox.innerHTML = `
    <strong>Nome:</strong> ${inputNome.value}<br>
    <strong>Símbolo:</strong> ${inputSymbol.value}<br>
    <strong>Decimais:</strong> ${inputDecimals.value}<br>
    <strong>Total Supply:</strong> ${inputSupply.value}<br>
    <strong>Proprietário:</strong> ${ownerChecksum}<br>
    <strong>Logo:</strong> ${inputImage.value || "-"}<br>
    <strong>Rede:</strong> ${networkDisplay ? networkDisplay.textContent : "Não detectada"}<br>
    <strong>Tipo de Endereço:</strong> ${(radioPersonalizado && radioPersonalizado.checked) ? "Personalizado" : "Padrão"}
  `;
}

// -------------------- Handlers navegação --------------------
document.getElementById('next-step-1').addEventListener('click', nextStep);
document.getElementById('next-step-2').addEventListener('click', nextStep);
document.getElementById('next-step-3').addEventListener('click', nextStep);
if (nextStep4) nextStep4.addEventListener('click', nextStep);

document.querySelectorAll('.navigation .btn-secondary').forEach(btn => {
  btn.addEventListener('click', prevStep);
});

// Reiniciar fluxo
const btnReiniciar = document.querySelector('button[onclick="reiniciarFluxo()"]');
if (btnReiniciar) btnReiniciar.addEventListener('click', reiniciarFluxo);

// -------------------- Handlers principais --------------------
btnSalvarContrato.onclick = () => {
  let ownerChecksum = inputOwner.value;
  try {
    if (window.ethers && window.ethers.utils) {
      ownerChecksum = window.ethers.utils.getAddress(inputOwner.value);
    }
  } catch (e) {}
  salvarContrato({
    nome: inputNome.value,
    symbol: inputSymbol.value,
    decimals: inputDecimals.value,
    supply: inputSupply.value,
    owner: ownerChecksum,
    image: inputImage.value
  }, () => {
    btnCompilar.disabled = false;
    compileStatus.textContent = "";
  });
};



// Spinner Overlay helpers

// Barra de progresso/contador na compilação
function startCompileProgressBar() {
  let percent = 0;
  let dots = 0;
  compileStatus.textContent = `Compilando contrato... 0%`;
  const interval = setInterval(() => {
    percent += Math.floor(Math.random() * 3) + 2; // Progresso mais lento e realista
    if (percent >= 95) percent = 95; // Para em 95% até a compilação real terminar
    
    // Adiciona pontos animados
    dots = (dots + 1) % 4;
    let dotStr = '.'.repeat(dots);
    compileStatus.textContent = `Compilando contrato${dotStr} ${percent}%`;
  }, 300);
  return interval;
}

function stopCompileProgressBar(interval, success = true) {
  if (interval) clearInterval(interval);
  if (success) {
    compileStatus.textContent = '✅ Compilado com sucesso!';
    compileStatus.style.color = '#16924b';
  } else {
    compileStatus.style.color = '#b91c1c';
  }
}

btnCompilar.onclick = async () => {
  console.log('🔍 Verificando estado antes da compilação...');
  debugContractState();
  
  if (!contratoSource || !contratoSource.trim()) {
    compileStatus.textContent = '⚠️ Salve o contrato antes de compilar!';
    compileStatus.style.color = '#b91c1c';
    return;
  }
  
  console.log('🚀 Iniciando compilação via API...');
  compileStatus.style.color = '#333';
  let progressInterval = startCompileProgressBar();
  
  try {
    const result = await compilarContrato(inputNome.value, btnCompilar, compileStatus, btnDeploy);
    console.log('✅ Compilação concluída:', result);
    stopCompileProgressBar(progressInterval, true);
    
    // Mostra botão para dados de verificação
    if (btnVerificationInfo) {
      btnVerificationInfo.style.display = 'inline-block';
      btnVerificationInfo.disabled = false;
    }
    
  } catch (error) {
    console.error('❌ Erro na compilação:', error);
    stopCompileProgressBar(progressInterval, false);
    btnCompilar.disabled = false;
  }
};

// Handler para botão de verificação
if (btnVerificationInfo) {
  btnVerificationInfo.onclick = () => {
    console.log('📋 Mostrando informações de verificação...');
    showVerificationInfo();
    
    // Mostra uma modal ou alerta com instruções
    const instructions = `
📋 DADOS DE VERIFICAÇÃO COPIADOS NO CONSOLE!

1. Abra o Console do navegador (F12)
2. Procure por "DADOS PARA VERIFICAÇÃO NO EXPLORADOR"
3. Use as funções:
   - window.verificationElements.sourceCode.select() + Ctrl+C (copiar código)
   - window.verificationElements.abi.select() + Ctrl+C (copiar ABI)

🔧 CONFIGURAÇÕES PARA O EXPLORADOR:
- Compiler Version: v0.8.19+commit.7dd6d404
- Optimization: No
- Runs: 200

⚠️ IMPORTANTE: Use EXATAMENTE estas configurações no explorador!
    `;
    
    alert(instructions);
  };
}






// ----------- Passo 5: Adicionar ao MetaMask e Compartilhar Link -----------
const btnAddMetaMask = document.getElementById('btn-add-metamask');
const btnShareLink = document.getElementById('btn-share-link');
const shareLinkField = document.getElementById('share-link-field');
const statusDiv = document.getElementById('metamask-status');

if (btnAddMetaMask) btnAddMetaMask.disabled = true;
if (btnShareLink) btnShareLink.style.display = 'none';
if (shareLinkField) shareLinkField.style.display = 'none';

if (btnAddMetaMask) {
  btnAddMetaMask.onclick = async function() {
    statusDiv.textContent = '';
    btnAddMetaMask.disabled = true;
    try {
      const address = document.getElementById('final-token-address').value;
      const symbol = document.getElementById('final-token-symbol').value;
      const decimals = parseInt(document.getElementById('final-token-decimals').value, 10);
      const image = document.getElementById('final-token-image').value;
      // Recupera chainId e dados de rede do campo oculto
      let networkData = null;
      if (networkValue && networkValue.value) {
        try {
          networkData = JSON.parse(networkValue.value);
        } catch (e) {
          console.log('Erro ao parse dados da rede:', e);
        }
      }
      let chainId = networkData ? networkData.chainId : null;
      let tokenData = { address, symbol, decimals, image };
      if (chainId) {
        tokenData.chainId = chainId.startsWith('0x') ? parseInt(chainId, 16) : parseInt(chainId);
      }
      // Tenta trocar para a rede correta antes de adicionar
      let switched = true;
      if (tokenData.chainId) {
        switched = await switchOrAddNetwork(tokenData);
      }
      if (!switched) {
        statusDiv.textContent = 'Não foi possível trocar para a rede do token.';
        statusDiv.style.color = '#b91c1c';
        btnAddMetaMask.disabled = false;
        return;
      }
      const result = await adicionarTokenMetaMask({ address, symbol, decimals, image });
      if (result) {
        statusDiv.textContent = 'Token adicionado ao MetaMask!';
        statusDiv.style.color = '#16924b';
        if (btnShareLink) btnShareLink.style.display = 'inline-block';
      } else {
        statusDiv.textContent = 'Não foi possível adicionar o token.';
        statusDiv.style.color = '#b91c1c';
      }
    } catch (e) {
      statusDiv.textContent = 'Erro ao adicionar token: ' + (e.message || e);
      statusDiv.style.color = '#b91c1c';
    }
    btnAddMetaMask.disabled = false;
  };
}

if (btnShareLink) {
  btnShareLink.onclick = () => {
    const address = document.getElementById('final-token-address').value;
    const symbol = document.getElementById('final-token-symbol').value;
    const decimals = parseInt(document.getElementById('final-token-decimals').value, 10);
    const image = document.getElementById('final-token-image').value;
    const link = gerarLinkToken({ address, symbol, decimals, image });
    // Web Share API se disponível
    if (navigator.share) {
      navigator.share({
        title: 'Token criado',
        text: 'Veja o token que acabei de criar:',
        url: link
      }).catch(() => {
        // fallback se usuário cancelar
      });
    } else {
      shareLinkField.value = link;
      shareLinkField.style.display = 'block';
      shareLinkField.select();
      document.execCommand('copy');
      btnShareLink.textContent = '🔗 Link Copiado!';
      setTimeout(() => {
        btnShareLink.textContent = '🔗 Compartilhar Link';
      }, 2000);
    }
  };
}

btnDeploy.onclick = async () => {
  await deployContrato(btnDeploy, deployStatus);
  // Após deploy, preencher campos do passo MetaMask
  const address = window.contractAddress || '';
  document.getElementById('final-token-address').value = address;
  document.getElementById('final-token-symbol').value = inputSymbol.value;
  document.getElementById('final-token-decimals').value = inputDecimals.value;
  document.getElementById('final-token-image').value = inputImage.value;
  // Habilita o botão MetaMask se todos os campos estiverem preenchidos
  if (btnAddMetaMask) {
    if (address && inputSymbol.value && inputDecimals.value) {
      btnAddMetaMask.disabled = false;
    } else {
      btnAddMetaMask.disabled = true;
    }
  }
  // Esconde botão de compartilhar link e campo de link ao novo deploy
  if (btnShareLink) btnShareLink.style.display = 'none';
  if (shareLinkField) shareLinkField.style.display = 'none';
};

// -------------------- Busca Salt --------------------
document.getElementById('search-salt-btn').onclick = () => buscarSaltFake(targetSuffix.value, saltFound, predictedAddress);
document.getElementById('stop-search-btn').onclick = () => pararBuscaSalt();

// -------------------- Personalização do endereço --------------------
function toggleAddressCustomization() {
  const showCustom = (radioPersonalizado && radioPersonalizado.checked);
  document.getElementById('customization-section').style.display = showCustom ? '' : 'none';
}

document.getElementById('contrato-simples').addEventListener('change', toggleAddressCustomization);
if (radioPersonalizado) {
  radioPersonalizado.addEventListener('change', toggleAddressCustomization);
}

// -------------------- Inicialização --------------------
showStep(1);
toggleAddressCustomization();

// Inicializa apenas sistema de redes (sem detectar automaticamente)
initNetworkSystem();

// -------------------- Expor funções no window para HTML legacy (se necessário) --------------------
window.toggleAddressCustomization = toggleAddressCustomization;
window.buscarSalt = () => buscarSaltFake(targetSuffix.value, saltFound, predictedAddress);
window.pararBusca = pararBuscaSalt;
window.marcarConcluido = marcarConcluido; // Expõe função marcarConcluido globalmente
// Garante que a função global nunca receba undefined
window.adicionarTokenMetaMask = function(args) {
  // Log para depuração
  console.log('adicionarTokenMetaMask chamado com:', args);
  if (!args || typeof args !== 'object') {
    alert('Dados do token não informados!');
    return;
  }
  // Remove espaços extras
  const address = (args.address || '').trim();
  const symbol = (args.symbol || '').trim();
  const decimals = Number(args.decimals);
  const image = (args.image || '').trim();
  if (!address || !symbol || isNaN(decimals) || decimals < 0) {
    alert('Preencha todos os campos do token antes de adicionar ao MetaMask.');
    return;
  }
  adicionarTokenMetaMask({ address, symbol, decimals, image });
};