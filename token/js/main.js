

import { marcarConcluido, clearErrors, markErrors } from './utils.js';
import { salvarContrato, compilarContrato } from './contratos.js';
import { deployContrato } from './deploy.js';
import { connectMetaMask, listenMetaMask, adicionarTokenMetaMask } from './metamask.js';
import { buscarSaltFake, pararBuscaSalt } from './salt.js';


document.addEventListener('DOMContentLoaded', () => {
  // Garante que o botão Compilar começa desabilitado
  if (btnCompilar) btnCompilar.disabled = true;
  const btnConectar = document.getElementById('connect-metamask-btn');
  const btnNext = document.getElementById('next-step-1');
  if (btnConectar) {
    btnConectar.addEventListener('click', () => {
      connectMetaMask(inputOwner, networkDisplay);
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      nextStep();
    });
  }


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
const nextStep4 = document.getElementById('next-step-4');
const compileStatus = document.getElementById('compile-status');
const deployStatus = document.getElementById('deploy-status');
const networkDisplay = document.getElementById('networkDisplay');
let currentStep = 1;

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
  networkDisplay.value = "";
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
    <strong>Rede:</strong> ${networkDisplay.value || "-"}<br>
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
function showSpinnerOverlay(msg = "Processando...") {
  let overlay = document.getElementById('custom-spinner-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'custom-spinner-overlay';
    overlay.className = 'custom-spinner-overlay';
    overlay.innerHTML = `<div style=\"text-align:center\"><div class='custom-spinner'></div><div style='color:#fff;font-size:1.2rem;margin-top:16px'>${msg}</div></div>`;
    document.body.appendChild(overlay);
  } else {
    overlay.style.display = 'flex';
    overlay.querySelector('div').lastChild.textContent = msg;
  }
}
function hideSpinnerOverlay() {
  const overlay = document.getElementById('custom-spinner-overlay');
  if (overlay) overlay.style.display = 'none';
}

btnCompilar.onclick = () => {
  if (!window.contratoSource || !window.contratoSource.trim()) {
    compileStatus.textContent = '⚠️ Salve o contrato antes de compilar!';
    return;
  }
  showSpinnerOverlay('Compilando contrato...');
  compileStatus.textContent = '';
  compilarContrato(inputNome.value, btnCompilar, compileStatus, btnDeploy)
    .finally(() => {
      hideSpinnerOverlay();
    });
};



const btnAddMetaMask = document.querySelector('button[onclick^="adicionarTokenMetaMask"]');
if (btnAddMetaMask) btnAddMetaMask.disabled = true;

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
};

listenMetaMask(inputOwner, networkDisplay);

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

// -------------------- Expor funções no window para HTML legacy (se necessário) --------------------
window.toggleAddressCustomization = toggleAddressCustomization;
window.buscarSalt = () => buscarSaltFake(targetSuffix.value, saltFound, predictedAddress);
window.pararBusca = pararBuscaSalt;
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
});