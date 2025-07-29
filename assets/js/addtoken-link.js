function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMetaMaskBrowser() {
    return !!window.ethereum && /MetaMask/i.test(navigator.userAgent);
}

function getNetworkNameByChainId(chainIdHex) {
    const map = {
        '0x1': 'Ethereum Mainnet (1)',
        '0x38': 'BNB Smart Chain (56)',
        '0x89': 'Polygon (137)',
        '0x61': 'BSC Testnet (97)',
        '0x5': 'Goerli Testnet (5)',
        '0xaa36a7': 'Sepolia (11155111)',
    };
    return map[chainIdHex] || `ChainId: ${parseInt(chainIdHex, 16)} (${chainIdHex})`;
}

async function switchNetworkIfNeeded(decoded) {
    if (!window.ethereum) return false;
    try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainIdDec = parseInt(currentChainId, 16);
        const expectedChainIdDec = parseInt(decoded.chainId);

        if (currentChainIdDec === expectedChainIdDec) return true;

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x' + expectedChainIdDec.toString(16) }]
            });
            return true;
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x' + expectedChainIdDec.toString(16),
                            chainName: decoded.networkName || decoded.chainName,
                            rpcUrls: [decoded.rpcUrl],
                            blockExplorerUrls: [decoded.blockExplorer],
                            nativeCurrency: {
                                name: decoded.nativeCurrency,
                                symbol: decoded.nativeCurrency,
                                decimals: parseInt(decoded.nativeDecimals) || 18
                            }
                        }]
                    });
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x' + expectedChainIdDec.toString(16) }]
                    });
                    return true;
                } catch (addError) {
                    showMobileErrorMessage("Não foi possível adicionar ou trocar para a rede automaticamente.", decoded);
                    return false;
                }
            } else {
                showMobileErrorMessage("Não foi possível trocar de rede automaticamente.", decoded);
                return false;
            }
        }
    } catch (e) {
        showMobileErrorMessage("Erro ao verificar ou trocar a rede.", decoded);
        return false;
    }
}

async function addTokenFlow() {
    const params = new URLSearchParams(window.location.search);
    let encodedData = params.get('data');
    // CORREÇÃO: só usa o que vem antes de um '=' extra para garantir atualização sem quebrar a decodificação
    if (encodedData && encodedData.includes('=')) {
        encodedData = encodedData.split('=')[0];
    }
    let decoded = {};
    try {
        decoded = JSON.parse(atob(encodedData));
    } catch (e) {
        document.getElementById('status').innerHTML = `<span class="text-danger">❌ Dados inválidos no link.</span>`;
        return;
    }

    if (!window.ethereum) {
        document.getElementById('status').innerHTML = `<span class="text-danger">❌ MetaMask não detectado no navegador.</span>`;
        return;
    }

    const networkOk = await switchNetworkIfNeeded(decoded);
    if (!networkOk) {
        return;
    }

    try {
        const wasAdded = await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: decoded.tokenAddress,
                    symbol: decoded.tokenSymbol,
                    decimals: parseInt(decoded.tokenDecimals),
                    image: decoded.tokenImage || undefined
                }
            }
        });
        if (wasAdded) {
            document.getElementById('status').innerHTML = `<span class="text-success">✅ Token adicionado com sucesso!</span>`;
        } else {
            document.getElementById('status').innerHTML = `<span class="text-warning">⚠️ Token não foi adicionado.</span>`;
        }
    } catch (e) {
        showMobileErrorMessage("Erro ao tentar adicionar o token.", decoded);
    }
}

function getAjudaHtml(decoded) {
    return `
<div class="alert alert-secondary mt-3">

  <strong>ACONSELHAMOS O ACESSO PELO DESKTOP, POIS ESTES PROCEDIMENTOS NÃO SÃO NECESSÁRIOS.</strong><br><br>
  <br><br>
  <strong>Como cadastrar a rede e o token manualmente no MetaMask Mobile:</strong><br><br>

  <b>Cadastrar a rede (se ainda não cadastrada):</b><br>
  Acesse o menu do MetaMask e vá em <b>Configurações &rarr; Redes</b>.<br>
  Toque em <b>Adicionar Rede</b> e preencha os campos abaixo:<br>
  <b>Nome da rede:</b> ${decoded.networkName || '-'}<br>
  <b>RPC:</b> ${decoded.rpcUrl || '-'}<br>
  <b>ChainID:</b> ${decoded.chainId || '-'}<br>
  <b>Moeda nativa:</b> ${decoded.nativeCurrency || '-'}<br>
  <b>Explorer:</b> ${decoded.blockExplorer || '-'}<br><br>

  <b>Selecionar a rede correta:</b><br>
  Depois de cadastrada, selecione a rede criada no topo do app.<br><br>

  <b>Cadastrar o token:</b><br>
  Na rede correta, vá em <b>Importar Token</b> e informe:<br>
  <b>Endereço do token:</b> ${decoded.tokenAddress || '-'}<br>
  <b>Símbolo:</b> ${decoded.tokenSymbol || '-'}<br>
  <b>Decimais:</b> ${decoded.tokenDecimals || '-'}<br><br>

  <b>Após cadastrar, volte nesta página e clique em "Adicionar Token ao MetaMask" para tentar o processo automático.</b><br><br>

  <div class="mt-2">Se continuar tendo problemas, reinicie o aplicativo MetaMask e tente novamente.</div>
</div>
    `;
}

function showMobileErrorMessage(msg, decoded) {
    document.getElementById('status').innerHTML = `
      <div class="alert alert-danger">
        <b>${msg}</b><br>
        <ul>
          <li>Verifique se a rede está cadastrada corretamente no MetaMask.</li>
          <li>Confira se você selecionou a rede correta antes de adicionar o token.</li>
          <li>Se necessário, siga as instruções de ajuda para cadastrar ou alterar a rede e depois volte aqui.</li>
        </ul>
      </div>
    `;
    // Mostra botão de ajuda se não estiver visível
    const btnAjuda = document.getElementById('btnAjuda');
    if (btnAjuda && btnAjuda.style.display !== 'block') {
        btnAjuda.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    let encodedData = params.get('data');
    // CORREÇÃO: só usa o que vem antes de um '=' extra para garantir atualização sem quebrar a decodificação
    if (encodedData && encodedData.includes('=')) {
        encodedData = encodedData.split('=')[0];
    }
    let decoded = {};
    try {
        decoded = JSON.parse(atob(encodedData));
    } catch (e) {
        document.getElementById('status').innerHTML = `<span class="text-danger">❌ Dados inválidos no link.</span>`;
        return;
    }

    document.getElementById('tokenAddressText').textContent = decoded.tokenAddress || '-';
    document.getElementById('tokenNameText').textContent = decoded.tokenName || '-';
    document.getElementById('tokenSymbolText').textContent = decoded.tokenSymbol || '-';
    document.getElementById('tokenDecimalsText').textContent = decoded.tokenDecimals || '-';
    if (decoded.tokenImage) {
        document.getElementById('tokenImageText').innerHTML = `<img src="${decoded.tokenImage}" alt="Token Logo" style="max-width:32px;border-radius:6px;">`;
    } else {
        document.getElementById('tokenImageText').innerHTML = '<span class="text-muted">Não disponível</span>';
    }
    if (decoded.networkName && decoded.networkName.trim() !== "") {
        document.getElementById('tokenNetworkText').textContent = decoded.networkName;
    } else if (decoded.nativeCurrency) {
        let networkFull = decoded.nativeCurrency;
        if (decoded.nativeCurrency === "BNB") networkFull = "BNB Smart Chain";
        if (decoded.nativeCurrency === "ETH") networkFull = "Ethereum";
        if (decoded.nativeCurrency === "MATIC") networkFull = "Polygon";
        document.getElementById('tokenNetworkText').textContent = networkFull;
    } else {
        document.getElementById('tokenNetworkText').innerHTML = '<span class="text-muted">Não disponível</span>';
    }

    const btnAddToken = document.getElementById('btnAddToken');
    const btnOpenMetaMask = document.getElementById('btnOpenMetaMask');
    const manualDiv = document.getElementById('manual');
    const statusDiv = document.getElementById('status');
    const avisoRede = document.getElementById('avisoRede');
    const btnAjuda = document.getElementById('btnAjuda');
    const ajudaContent = document.getElementById('ajudaContent');

    if (isMobile()) {
        // Remove qualquer info de rede conectada
        const connectedNetwork = document.getElementById('connectedNetwork');
        if (connectedNetwork) connectedNetwork.innerHTML = "";

        // Mensagem de orientação acima do botão
        if (avisoRede) {
            avisoRede.style.display = "block";
            avisoRede.innerHTML = `<div class="alert alert-info mt-2">
                <b>Atenção:</b> Antes de clicar, <b>verifique se a rede está cadastrada e selecionada no MetaMask</b>.
            </div>`;
        }

        // Botão de ajuda visível
        if (btnAjuda) {
            btnAjuda.style.display = "block";
            btnAjuda.onclick = function() {
                if (ajudaContent.style.display === "block") {
                    ajudaContent.style.display = "none";
                    btnAjuda.textContent = "Ajuda";
                } else {
                    ajudaContent.innerHTML = getAjudaHtml(decoded);
                    ajudaContent.style.display = "block";
                    btnAjuda.textContent = "Fechar Ajuda";
                }
            };
        }

        // Ativa botão adicionar token somente dentro do MetaMask
        if (isMetaMaskBrowser()) {
            if (btnAddToken) {
                btnAddToken.style.display = "block";
                btnAddToken.onclick = addTokenFlow;
            }
            if (btnOpenMetaMask) btnOpenMetaMask.style.display = "none";
            if (manualDiv) manualDiv.style.display = "none";
        } else {
            // Não está no navegador do MetaMask
            if (btnAddToken) btnAddToken.style.display = "none";
            if (btnOpenMetaMask) btnOpenMetaMask.style.display = "block";
            if (manualDiv) manualDiv.style.display = "none";
            btnOpenMetaMask.onclick = function() {
                const dappUrl = window.location.href.replace(/^https?:\/\//, '');
                window.open(`https://metamask.app.link/dapp/${dappUrl}`, '_blank');
            };
        }

    } else {
        // Desktop
        if (btnAddToken) {
            btnAddToken.style.display = "block";
            btnAddToken.onclick = addTokenFlow;
        }
        if (btnOpenMetaMask) btnOpenMetaMask.style.display = "none";
        if (manualDiv) {
            manualDiv.style.display = "none";
            manualDiv.innerHTML = "";
        }
        if (statusDiv) statusDiv.innerHTML = "";
        const connectedNetwork = document.getElementById('connectedNetwork');
        if (connectedNetwork) connectedNetwork.innerHTML = "";
        if (avisoRede) avisoRede.style.display = "none";
        if (btnAjuda) btnAjuda.style.display = "none";
        if (ajudaContent) ajudaContent.style.display = "none";
    }
});