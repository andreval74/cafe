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

/**
 * Adiciona o token gerado ao MetaMask do usuário
 * Parâmetros: symbol, decimals, address, image (opcional)
 */
export async function adicionarTokenMetaMask({ address, symbol, decimals, image }) {
  if (!window.ethereum) {
    alert("MetaMask não encontrada. Instale a extensão MetaMask no seu navegador!");
    return false;
  }
  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address,
          symbol,
          decimals: Number(decimals),
          image: image || undefined
        }
      }
    });
    if (wasAdded) {
      alert('Token adicionado ao MetaMask!');
    } else {
      alert('Token não foi adicionado ao MetaMask.');
    }
    return wasAdded;
  } catch (error) {
    alert('Erro ao adicionar token ao MetaMask: ' + (error && error.message ? error.message : error));
    return false;
  }
}