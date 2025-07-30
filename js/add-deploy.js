// deploy.js
// Deploy do contrato na blockchain via ethers.js + MetaMask

import { marcarConcluido } from './add-utils.js';
import { contratoAbi, contratoBytecode } from './add-contratos-verified.js';

/**
 * Faz o deploy do contrato usando ethers.js e MetaMask.
 * @param {HTMLElement} btnDeploy
 * @param {HTMLElement} deployStatus
 */
export async function deployContrato(btnDeploy, deployStatus) {
  btnDeploy.disabled = true;
  deployStatus.textContent = "Preparando deploy...";
  
  try {
    // Validações antes do deploy
    if (!contratoAbi || !contratoBytecode) {
      throw new Error("Contrato não foi compilado. Compile primeiro!");
    }
    
    console.log('🔍 Debug deploy:');
    console.log('ABI:', contratoAbi ? 'Presente' : 'NULL');
    console.log('Bytecode:', contratoBytecode ? `Presente (${contratoBytecode.length} chars)` : 'NULL');
    console.log('Bytecode preview:', contratoBytecode ? contratoBytecode.substring(0, 50) + '...' : 'NULL');
    
    if (!window.ethereum) throw new Error("MetaMask não encontrada");
    
    deployStatus.textContent = "Conectando com MetaMask...";
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Adapte conforme construtor do seu contrato
    let args = [];
    
    deployStatus.textContent = "Criando factory do contrato...";
    console.log('🏭 Criando ContractFactory...');
    const factory = new ethers.ContractFactory(contratoAbi, contratoBytecode, signer);
    
    deployStatus.textContent = "Enviando transação de deploy...";
    console.log('🚀 Enviando deploy...');
    const contract = await factory.deploy(...args);
    
    deployStatus.textContent = "Aguardando confirmação do deploy...";
    console.log('⏳ Aguardando confirmação...');
    await contract.deployTransaction.wait();
    
    console.log('✅ Deploy concluído:', contract.address);
    marcarConcluido(btnDeploy);
    deployStatus.textContent = "✅ Deploy realizado! Endereço: " + contract.address;
    deployStatus.style.color = '#16924b';
    
    window.contractAddress = contract.address;
    if (document.getElementById('next-step-4')) {
      document.getElementById('next-step-4').style.display = "inline-block";
    }
    
  } catch (e) {
    console.error('❌ Erro no deploy:', e);
    deployStatus.textContent = "❌ Erro no deploy: " + (e.message || e);
    deployStatus.style.color = '#b91c1c';
    btnDeploy.disabled = false;
  }
}