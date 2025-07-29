// deploy.js
// Deploy do contrato na blockchain via ethers.js + MetaMask

import { marcarConcluido } from './utils.js';
import { contratoAbi, contratoBytecode } from './contratos.js';

/**
 * Faz o deploy do contrato usando ethers.js e MetaMask.
 * @param {HTMLElement} btnDeploy
 * @param {HTMLElement} deployStatus
 */
export async function deployContrato(btnDeploy, deployStatus) {
  btnDeploy.disabled = true;
  deployStatus.textContent = "Enviando deploy...";
  try {
    if (!window.ethereum) throw new Error("MetaMask não encontrada");
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Adapte conforme construtor do seu contrato
    let args = [];

    const factory = new ethers.ContractFactory(contratoAbi, contratoBytecode, signer);
    const contract = await factory.deploy(...args);
    deployStatus.textContent = "Aguardando confirmação do deploy...";

    await contract.deployTransaction.wait();
    marcarConcluido(btnDeploy);
    deployStatus.textContent = "Deploy realizado! Endereço: " + contract.address;
    if (document.getElementById('next-step-4')) {
      document.getElementById('next-step-4').style.display = "inline-block";
    }
  } catch (e) {
    deployStatus.textContent = "Erro no deploy: " + (e.message || e);
    btnDeploy.disabled = false;
  }
}