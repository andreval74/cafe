
import { marcarConcluido, clearErrors, markErrors } from './utils.js';
import { salvarContrato, compilarContrato } from './contratos.js';
import { deployContrato } from './deploy.js';
import { connectMetaMask, listenMetaMask } from './metamask.js';
import { buscarSaltFake, pararBuscaSalt } from './salt.js';

console.log("main.js iniciado");

document.addEventListener('DOMContentLoaded', () => {
  const btnConectar = document.getElementById('connect-metamask-btn');
  const btnNext = document.getElementById('next-step-1');
  console.log('Botão conectar existe?', !!btnConectar);
  console.log('Botão próximo existe?', !!btnNext);

  if (btnConectar) {
    btnConectar.addEventListener('click', () => {
      console.log('Botão MetaMask clicado!');
      connectMetaMask(inputOwner, networkDisplay);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      console.log('Botão Próximo clicado!');
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

btnCompilar.onclick = () => {
  compilarContrato(inputNome.value, btnCompilar, compileStatus, btnDeploy);
};

btnDeploy.onclick = () => {
  deployContrato(btnDeploy, deployStatus);
};

// -------------------- MetaMask --------------------
document.getElementById('connect-metamask-btn').addEventListener('click', () => {
  console.log('Botão MetaMask clicado!');
  connectMetaMask(inputOwner, networkDisplay);
});
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
window.adicionarTokenMetaMask = typeof adicionarTokenMetaMask === "function" ? adicionarTokenMetaMask : () => {};
});