/**
 * 🔍 SISTEMA DE VERIFICAÇÃO AUTOMÁTICA DE CONTRATOS
 * Suporte para BSCScan, Etherscan, Polygonscan, etc.
 */

// Configuração das APIs de verificação por rede
const VERIFICATION_APIS = {
  1: { // Ethereum Mainnet
    name: 'Ethereum',
    url: 'https://api.etherscan.io/api',
    explorer: 'https://etherscan.io',
    key: 'YourApiKeyToken' // Substituir por chave real
  },
  56: { // BSC Mainnet
    name: 'BNB Smart Chain',
    url: 'https://api.bscscan.com/api',
    explorer: 'https://bscscan.com',
    key: 'YourApiKeyToken' // Substituir por chave real
  },
  97: { // BSC Testnet
    name: 'BNB Smart Chain Testnet',
    url: 'https://api-testnet.bscscan.com/api',
    explorer: 'https://testnet.bscscan.com',
    key: 'YourApiKeyToken' // Substituir por chave real
  },
  137: { // Polygon Mainnet
    name: 'Polygon',
    url: 'https://api.polygonscan.com/api',
    explorer: 'https://polygonscan.com',
    key: 'YourApiKeyToken' // Substituir por chave real
  },
  43114: { // Avalanche Mainnet
    name: 'Avalanche',
    url: 'https://api.snowtrace.io/api',
    explorer: 'https://snowtrace.io',
    key: 'YourApiKeyToken' // Substituir por chave real
  }
};

/**
 * Função principal de verificação automática
 */
export async function verificarContratoAutomaticamente(contractAddress, chainId) {
  const statusElement = document.getElementById('verification-status');
  
  try {
    // Verificar se a rede suporta verificação automática
    const apiConfig = VERIFICATION_APIS[chainId];
    if (!apiConfig) {
      return showManualVerification('Rede não suporta verificação automática');
    }
    
    // Obter dados do contrato compilado
    const contractData = getContractData();
    if (!contractData.isValid) {
      throw new Error('Dados do contrato inválidos. Compile novamente.');
    }
    
    // Atualizar status
    updateVerificationStatus('🔄 Iniciando verificação automática...', 'info');
    
    // Enviar para verificação
    const submitResult = await submitContractVerification(contractAddress, chainId, contractData);
    
    if (!submitResult.success) {
      return showManualVerification(`Erro na submissão: ${submitResult.error}`);
    }
    
    // Aguardar resultado
    updateVerificationStatus('⏳ Processando verificação... (pode demorar até 60 segundos)', 'info');
    
    const verificationResult = await waitForVerificationResult(submitResult.guid, chainId);
    
    if (verificationResult.success) {
      showVerificationSuccess(contractAddress, chainId);
    } else {
      showManualVerification(`Verificação falhou: ${verificationResult.error}`);
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação automática:', error);
    showManualVerification(`Erro: ${error.message}`);
  }
}

/**
 * Submete contrato para verificação
 */
async function submitContractVerification(contractAddress, chainId, contractData) {
  const apiConfig = VERIFICATION_APIS[chainId];
  
  const params = {
    module: 'contract',
    action: 'verifysourcecode',
    apikey: apiConfig.key,
    contractaddress: contractAddress,
    sourceCode: contractData.sourceCode,
    codeformat: 'solidity-single-file',
    contractname: contractData.contractName,
    compilerversion: contractData.compilerVersion,
    optimizationUsed: contractData.optimizationUsed ? 1 : 0,
    runs: contractData.runs,
    evmversion: contractData.evmVersion || 'default'
  };
  
  try {
    const response = await fetch(apiConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params)
    });
    
    const result = await response.json();
    
    if (result.status === '1') {
      return { success: true, guid: result.result };
    } else {
      return { success: false, error: result.result || 'Erro desconhecido' };
    }
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Aguarda resultado da verificação via polling
 */
async function waitForVerificationResult(guid, chainId, maxAttempts = 12) {
  const apiConfig = VERIFICATION_APIS[chainId];
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const params = {
        module: 'contract',
        action: 'checkverifystatus',
        apikey: apiConfig.key,
        guid: guid
      };
      
      const response = await fetch(`${apiConfig.url}?${new URLSearchParams(params)}`);
      const result = await response.json();
      
      if (result.status === '1') {
        return { success: true, result: result.result };
      } else if (result.result === 'Pending in queue') {
        // Continua tentando
        updateVerificationStatus(`⏳ Verificação em progresso... (tentativa ${attempt}/${maxAttempts})`, 'info');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Aguarda 5 segundos
        continue;
      } else {
        return { success: false, error: result.result };
      }
      
    } catch (error) {
      if (attempt === maxAttempts) {
        return { success: false, error: error.message };
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  return { success: false, error: 'Timeout: verificação demorou mais que o esperado' };
}

/**
 * Obtém dados do contrato compilado
 */
function getContractData() {
  // Importar variáveis globais do sistema
  if (typeof window.contratoSource === 'undefined' || 
      typeof window.contratoName === 'undefined' || 
      typeof window.resolvedCompilerVersion === 'undefined') {
    return { isValid: false };
  }
  
  return {
    isValid: true,
    sourceCode: window.contratoSource,
    contractName: window.contratoName,
    compilerVersion: `v${window.resolvedCompilerVersion}+commit.d5af09b8`, // Hash específico pode variar
    optimizationUsed: false,
    runs: 200,
    evmVersion: 'cancun'
  };
}

/**
 * Mostra sucesso da verificação automática
 */
function showVerificationSuccess(contractAddress, chainId) {
  const apiConfig = VERIFICATION_APIS[chainId];
  const contractUrl = `${apiConfig.explorer}/address/${contractAddress}#code`;
  const contractOverview = `${apiConfig.explorer}/address/${contractAddress}`;
  
  updateVerificationStatus(`
    <div class="verification-success">
      <h4>🎉 Contrato Verificado com Sucesso!</h4>
      <p>✅ Seu contrato foi verificado automaticamente no ${apiConfig.name}.</p>
      <div class="verification-links">
        <a href="${contractUrl}" target="_blank" class="btn-success">
          🔍 Ver Código Fonte Verificado
        </a>
        <a href="${contractOverview}" target="_blank" class="btn-contract-link" style="margin-left: 0.5em; background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 0.8em 1.3em; border-radius: 8px; text-decoration: none; font-weight: 500;">
          📋 Ver Detalhes do Contrato
        </a>
      </div>
      <div class="verification-note">
        <strong>🎯 Pronto!</strong> Seu contrato agora tem o selo de verificação e o código fonte está público.
        <br>
        <small>💡 <strong>Dica:</strong> Agora outros desenvolvedores podem ver e interagir com seu código diretamente no explorer!</small>
      </div>
    </div>
  `, 'success');
  
  // Habilita próximo passo
  const nextButton = document.getElementById('next-step-5');
  if (nextButton) {
    nextButton.style.display = 'inline-block';
  }
}

/**
 * Mostra interface de verificação manual com botões de cópia
 */
function showManualVerification(reason) {
  const contractData = getContractData();
  if (!contractData.isValid) {
    updateVerificationStatus('❌ Compile o contrato primeiro', 'error');
    return;
  }
  
  const chainId = getCurrentChainId();
  const apiConfig = VERIFICATION_APIS[chainId];
  const networkName = apiConfig ? apiConfig.name : 'Rede Atual';
  const explorerUrl = apiConfig ? apiConfig.explorer : '#';
  
  // Gerar URL direto para verificação (se possível)
  const contractAddress = window.enderecoContrato || '';
  let verificationUrl = explorerUrl;
  
  // URLs específicas para verificação por rede
  if (apiConfig) {
    switch (chainId) {
      case 1: // Ethereum
        verificationUrl = `${explorerUrl}/verifyContract?a=${contractAddress}`;
        break;
      case 56: // BSC Mainnet
        verificationUrl = `${explorerUrl}/verifyContract?a=${contractAddress}`;
        break;
      case 97: // BSC Testnet
        verificationUrl = `${explorerUrl}/verifyContract?a=${contractAddress}`;
        break;
      case 137: // Polygon
        verificationUrl = `${explorerUrl}/verifyContract?a=${contractAddress}`;
        break;
      case 43114: // Avalanche
        verificationUrl = `${explorerUrl}/verifyContract?a=${contractAddress}`;
        break;
      default:
        verificationUrl = explorerUrl;
    }
  }
  
  updateVerificationStatus(`
    <div class="manual-verification">
      <div class="verification-info">
        <h4>📋 Verificação Manual Necessária</h4>
        <p class="reason">⚠️ ${reason}</p>
        <p>Não se preocupe! Preparamos tudo para facilitar o processo manual.</p>
      </div>
      
      <div class="verification-links-section">
        <h5>🚀 Acesso Direto à Verificação:</h5>
        <div class="verification-quick-links">
          ${contractAddress ? `
            <a href="${verificationUrl}" target="_blank" class="btn-verification-direct">
              🔗 Ir Direto para Verificação no ${networkName}
            </a>
            <a href="${explorerUrl}/address/${contractAddress}" target="_blank" class="btn-contract-link">
              👁️ Ver Contrato no Explorer
            </a>
          ` : `
            <a href="${explorerUrl}" target="_blank" class="btn-verification-direct">
              🔗 Abrir ${networkName} Explorer
            </a>
          `}
        </div>
        <p class="quick-tip">💡 <strong>Dica:</strong> O primeiro link te leva direto para a página de verificação!</p>
      </div>
      
      <div class="verification-steps">
        <h5>📝 Passo a passo detalhado:</h5>
        <ol>
          <li>Clique no link azul acima para ir direto à página de verificação</li>
          <li>Na página que abrir, cole os dados fornecidos abaixo</li>
          <li>Use os botões "Copiar" para facilitar o processo</li>
          <li>Clique em "Verify and Publish" após preencher</li>
        </ol>
      </div>
      
      <div class="verification-data">
        <div class="data-group">
          <label>📋 Configurações do Compilador:</label>
          <div class="copy-section">
            <div class="config-grid">
              <div><strong>Compiler Version:</strong> ${contractData.compilerVersion}</div>
              <div><strong>Optimization:</strong> ${contractData.optimizationUsed ? 'Yes' : 'No'}</div>
              <div><strong>Runs:</strong> ${contractData.runs}</div>
              <div><strong>EVM Version:</strong> ${contractData.evmVersion}</div>
            </div>
          </div>
        </div>
        
        <div class="data-group">
          <label>📄 Código Fonte:</label>
          <div class="copy-section">
            <textarea id="source-code-display" readonly>${contractData.sourceCode}</textarea>
            <button type="button" class="btn-copy" onclick="copySourceCode()">
              📋 Copiar Código Fonte
            </button>
          </div>
        </div>
        
        <div class="data-group">
          <label>⚙️ ABI (Application Binary Interface):</label>
          <div class="copy-section">
            <textarea id="abi-display" readonly>${JSON.stringify(window.contratoAbi || [], null, 2)}</textarea>
            <button type="button" class="btn-copy" onclick="copyABI()">
              📋 Copiar ABI
            </button>
          </div>
        </div>
      </div>
      
      <div class="verification-help">
        <h5>💡 Dicas importantes:</h5>
        <ul>
          <li>✅ Use EXATAMENTE as configurações mostradas acima</li>
          <li>🔄 O processo pode demorar alguns minutos</li>
          <li>📧 Alguns exploradores enviam email de confirmação</li>
          <li>🆔 Mantenha a aba aberta durante o processo</li>
        </ul>
      </div>
    </div>
  `, 'manual');
  
  // Habilita próximo passo mesmo na verificação manual
  const nextButton = document.getElementById('next-step-5');
  if (nextButton) {
    nextButton.style.display = 'inline-block';
  }
}

/**
 * Atualiza status de verificação
 */
function updateVerificationStatus(html, type) {
  const statusElement = document.getElementById('verification-status');
  if (statusElement) {
    statusElement.innerHTML = html;
    statusElement.className = `verification-status ${type}`;
  }
}

/**
 * Obtém Chain ID atual
 */
function getCurrentChainId() {
  // Tentar obter do MetaMask
  if (window.ethereum && window.ethereum.chainId) {
    return parseInt(window.ethereum.chainId, 16);
  }
  
  // Fallback para dados salvos do sistema
  try {
    const networkValue = document.getElementById('networkValue');
    if (networkValue && networkValue.value) {
      const networkData = JSON.parse(networkValue.value);
      return parseInt(networkData.chainId);
    }
  } catch (e) {
    console.log('Erro ao obter chainId:', e);
  }
  
  return 97; // Default BSC Testnet
}

/**
 * Funções de cópia para os botões
 */
window.copySourceCode = function() {
  const textarea = document.getElementById('source-code-display');
  textarea.select();
  document.execCommand('copy');
  
  const button = event.target;
  const originalText = button.textContent;
  button.textContent = '✅ Copiado!';
  button.style.backgroundColor = '#28a745';
  
  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = '';
  }, 2000);
};

window.copyABI = function() {
  const textarea = document.getElementById('abi-display');
  textarea.select();
  document.execCommand('copy');
  
  const button = event.target;
  const originalText = button.textContent;
  button.textContent = '✅ Copiado!';
  button.style.backgroundColor = '#28a745';
  
  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = '';
  }, 2000);
};

/**
 * Função para copiar configurações
 */
window.copyConfig = function() {
  const contractData = getContractData();
  const configText = `Compiler Version: ${contractData.compilerVersion}
Optimization: ${contractData.optimizationUsed ? 'Yes' : 'No'}
Runs: ${contractData.runs}
EVM Version: ${contractData.evmVersion}`;
  
  navigator.clipboard.writeText(configText).then(() => {
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✅ Copiado!';
    button.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
    }, 2000);
  });
};
