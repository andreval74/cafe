// Gerenciador de Redes - Detecta e gerencia informações de blockchain
// Versão 2.1.0 - Sistema de detecção automática de rede

export let currentNetwork = null;
export let deployedContract = null;

// Mapeamento de redes conhecidas
const NETWORKS = {
  1: { name: "Ethereum Mainnet", blockExplorer: "https://etherscan.io", verificationEndpoint: "https://api.etherscan.io/api" },
  5: { name: "Ethereum Goerli", blockExplorer: "https://goerli.etherscan.io", verificationEndpoint: "https://api-goerli.etherscan.io/api" },
  11155111: { name: "Ethereum Sepolia", blockExplorer: "https://sepolia.etherscan.io", verificationEndpoint: "https://api-sepolia.etherscan.io/api" },
  56: { name: "BNB Smart Chain", blockExplorer: "https://bscscan.com", verificationEndpoint: "https://api.bscscan.com/api" },
  97: { name: "BNB Testnet", blockExplorer: "https://testnet.bscscan.com", verificationEndpoint: "https://api-testnet.bscscan.com/api" },
  137: { name: "Polygon Mainnet", blockExplorer: "https://polygonscan.com", verificationEndpoint: "https://api.polygonscan.com/api" },
  80001: { name: "Polygon Mumbai", blockExplorer: "https://mumbai.polygonscan.com", verificationEndpoint: "https://api-testnet.polygonscan.com/api" },
  43114: { name: "Avalanche C-Chain", blockExplorer: "https://snowtrace.io", verificationEndpoint: "https://api.snowtrace.io/api" },
  43113: { name: "Avalanche Fuji", blockExplorer: "https://testnet.snowtrace.io", verificationEndpoint: "https://api-testnet.snowtrace.io/api" },
  250: { name: "Fantom Opera", blockExplorer: "https://ftmscan.com", verificationEndpoint: "https://api.ftmscan.com/api" },
  4002: { name: "Fantom Testnet", blockExplorer: "https://testnet.ftmscan.com", verificationEndpoint: "https://api-testnet.ftmscan.com/api" },
  42161: { name: "Arbitrum One", blockExplorer: "https://arbiscan.io", verificationEndpoint: "https://api.arbiscan.io/api" },
  421613: { name: "Arbitrum Goerli", blockExplorer: "https://goerli.arbiscan.io", verificationEndpoint: "https://api-goerli.arbiscan.io/api" },
  10: { name: "Optimism", blockExplorer: "https://optimistic.etherscan.io", verificationEndpoint: "https://api-optimistic.etherscan.io/api" },
  97: { name: "Base", blockExplorer: "https://basescan.org", verificationEndpoint: "https://api.basescan.org/api" },
  8453: { name: "Base Mainnet", blockExplorer: "https://basescan.org", verificationEndpoint: "https://api.basescan.org/api" }
};

/**
 * Detecta a rede atual conectada no MetaMask
 */
export async function detectCurrentNetwork() {
  try {
    if (!window.ethereum) {
      console.log('❌ MetaMask não encontrada');
      return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    
    const networkInfo = NETWORKS[network.chainId] || {
      name: `Rede Desconhecida (Chain ID: ${network.chainId})`,
      blockExplorer: null,
      verificationEndpoint: null
    };

    currentNetwork = {
      chainId: network.chainId,
      name: networkInfo.name,
      blockExplorer: networkInfo.blockExplorer,
      verificationEndpoint: networkInfo.verificationEndpoint,
      isSupported: !!networkInfo.blockExplorer
    };

    console.log('🔗 Rede detectada:', currentNetwork);
    return currentNetwork;

  } catch (error) {
    console.error('❌ Erro ao detectar rede:', error);
    return null;
  }
}

/**
 * Atualiza display da rede na interface
 */
export function updateNetworkDisplay(element) {
  if (!element) return;
  
  if (currentNetwork) {
    // Se for um input, usa value, senão usa textContent
    if (element.tagName === 'INPUT') {
      element.value = currentNetwork.name;
    } else {
      element.textContent = currentNetwork.name;
    }
    element.style.color = currentNetwork.isSupported !== false ? '#16924b' : '#b91c1c';
    
    if (currentNetwork.isSupported === false) {
      element.title = 'Rede não suportada para verificação automática';
    }
  } else {
    if (element.tagName === 'INPUT') {
      element.value = 'Não conectado';
    } else {
      element.textContent = 'Não conectado';
    }
    element.style.color = '#666';
  }
}

/**
 * Salva informações do contrato deployado
 */
export function saveDeployedContract(address, abi, bytecode, sourceCode, compilerVersion, contractName) {
  deployedContract = {
    address,
    abi,
    bytecode,
    sourceCode,
    compilerVersion,
    contractName,
    network: currentNetwork,
    deployTime: new Date().toISOString(),
    explorerUrl: currentNetwork?.blockExplorer ? `${currentNetwork.blockExplorer}/address/${address}` : null
  };
  
  console.log('💾 Contrato deployado salvo:', deployedContract);
  
  // Salva no localStorage para persistência
  localStorage.setItem('lastDeployedContract', JSON.stringify(deployedContract));
  
  return deployedContract;
}

/**
 * Tenta verificação automática do contrato
 */
export async function autoVerifyContract() {
  if (!deployedContract || !currentNetwork?.verificationEndpoint) {
    console.log('❌ Verificação automática não disponível');
    return { success: false, reason: 'Rede não suportada ou contrato não deployado' };
  }

  try {
    console.log('🔄 Tentando verificação automática...');
    
    // Parâmetros para verificação
    const verificationParams = {
      apikey: 'YourApiKeyToken', // Usuário precisa configurar
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: deployedContract.address,
      sourceCode: deployedContract.sourceCode,
      codeformat: 'solidity-single-file',
      contractname: deployedContract.contractName,
      compilerversion: deployedContract.compilerVersion,
      optimizationUsed: '0',
      runs: '200',
      constructorArguements: '', // Vazio para tokens simples
    };

    // Tenta verificação via API do explorador
    const response = await fetch(currentNetwork.verificationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(verificationParams)
    });

    const result = await response.json();
    
    if (result.status === '1') {
      console.log('✅ Verificação automática enviada!');
      return { 
        success: true, 
        guid: result.result,
        message: 'Verificação enviada com sucesso! Aguarde alguns minutos para processamento.'
      };
    } else {
      console.log('❌ Verificação automática falhou:', result.result);
      return { 
        success: false, 
        reason: result.result || 'Erro desconhecido'
      };
    }

  } catch (error) {
    console.error('❌ Erro na verificação automática:', error);
    return { 
      success: false, 
      reason: 'Erro de conexão: ' + error.message
    };
  }
}

/**
 * Gera dados formatados para verificação manual
 */
export function getVerificationData() {
  if (!deployedContract) {
    return null;
  }

  return {
    contractAddress: deployedContract.address,
    contractName: deployedContract.contractName,
    compilerVersion: deployedContract.compilerVersion,
    optimization: 'No',
    runs: '200',
    sourceCode: deployedContract.sourceCode,
    abi: JSON.stringify(deployedContract.abi, null, 2),
    explorerUrl: deployedContract.explorerUrl,
    networkName: deployedContract.network?.name,
    verificationUrl: deployedContract.network?.blockExplorer ? 
      `${deployedContract.network.blockExplorer}/verifyContract?a=${deployedContract.address}` : null
  };
}

/**
 * Monitora mudanças de rede
 */
export function setupNetworkMonitoring(networkDisplayElement) {
  if (!window.ethereum) return;

  // Detecta rede inicial
  detectCurrentNetwork().then(() => {
    updateNetworkDisplay(networkDisplayElement);
  });

  // Monitora mudanças de rede
  window.ethereum.on('chainChanged', async (chainId) => {
    console.log('🔄 Rede alterada para:', parseInt(chainId, 16));
    await detectCurrentNetwork();
    updateNetworkDisplay(networkDisplayElement);
  });

  // Monitora mudanças de conta
  window.ethereum.on('accountsChanged', async (accounts) => {
    if (accounts.length > 0) {
      console.log('👤 Conta alterada para:', accounts[0]);
      await detectCurrentNetwork();
      updateNetworkDisplay(networkDisplayElement);
    }
  });
}
