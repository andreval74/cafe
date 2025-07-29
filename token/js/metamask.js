// metamask.js
// Integração com MetaMask, eventos de troca de conta e rede

/**
 * Solicita conexão com MetaMask, preenche owner e rede em inputs.
 * @param {HTMLInputElement} inputOwner 
 * @param {HTMLInputElement} networkDisplay
 */
export async function connectMetaMask(inputOwner, networkDisplay) {
  if (!window.ethereum) {
    alert("MetaMask não encontrada. Instale a extensão MetaMask no seu navegador!");
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const owner = accounts[0] || "";
    inputOwner.value = owner;
    inputOwner.readOnly = false;
    inputOwner.style.background = "#e9f7ef";
    networkDisplay.value = chainId;
    document.getElementById('connect-metamask-btn').style.display = "none";
    document.getElementById('connected-wallet-info').style.display = "";
  } catch (err) {
    alert("Erro ao conectar MetaMask: " + (err && err.message ? err.message : err));
  }
}

/**
 * Monitora eventos de troca de conta e rede do MetaMask.
 * Atualiza os inputs de owner e rede em tempo real.
 * @param {HTMLInputElement} inputOwner 
 * @param {HTMLInputElement} networkDisplay
 */
export function listenMetaMask(inputOwner, networkDisplay) {
  if (!window.ethereum) return;
  window.ethereum.on('accountsChanged', function (accounts) {
    if (accounts[0]) inputOwner.value = accounts[0];
  });
  window.ethereum.on('chainChanged', function (chainId) {
    networkDisplay.value = chainId;
  });
}