/**
 * 🔍 SISTEMA DE VERIFICAÇÃO MANUAL DE CONTRATOS
 * Interface user-friendly para verificação manual com links diretos
 */

// Configuração das redes e explorers
const VERIFICATION_APIS = {
  1: { // Ethereum Mainnet
    name: 'Ethereum',
    explorer: 'https://etherscan.io'
  },
  56: { // BSC Mainnet
    name: 'BNB Smart Chain',
    explorer: 'https://bscscan.com'
  },
  97: { // BSC Testnet
    name: 'BNB Smart Chain Testnet',
    explorer: 'https://testnet.bscscan.com'
  },
  137: { // Polygon Mainnet
    name: 'Polygon',
    explorer: 'https://polygonscan.com'
  },
  43114: { // Avalanche Mainnet
    name: 'Avalanche',
    explorer: 'https://snowtrace.io'
  }
};

/**
 * Função principal - apenas verificação manual
 */
export async function verificarContratoManualmente(contractAddress, chainId) {
  const contractData = getContractData();
  if (!contractData.isValid) {
    updateVerificationStatus('❌ Compile o contrato primeiro', 'error');
    return;
  }
  
  showManualVerification(contractAddress, chainId, 'Verificação manual selecionada');
}

/**
 * Mostra interface de verificação manual com todas as melhorias
 */
function showManualVerification(contractAddress, chainId, reason) {
  const contractData = getContractData();
  if (!contractData.isValid) {
    updateVerificationStatus('❌ Compile o contrato primeiro', 'error');
    return;
  }
  
  const apiConfig = VERIFICATION_APIS[chainId];
  const networkName = apiConfig ? apiConfig.name : 'Rede Atual';
  const explorerUrl = apiConfig ? apiConfig.explorer : '#';
  
  // URLs corretas para verificação direta no contrato específico
  const contractExplorerUrl = explorerUrl + '/address/' + contractAddress;
  const verificationDirectUrl = explorerUrl + '/verifyContract?a=' + contractAddress;
  
  const htmlContent = `
    <div class="manual-verification">
      <div class="verification-info">
        <h4>📋 Verificação Manual de Contrato</h4>
        <p class="reason">ℹ️ ${reason}</p>
        <p>Tudo pronto! Use os dados abaixo para verificar seu contrato facilmente.</p>
      </div>
      
      <div class="contract-address-section">
        <h5>📍 Endereço do Contrato:</h5>
        <div class="copy-section">
          <input type="text" id="contract-address-display" value="${contractAddress}" readonly>
          <button type="button" class="btn-copy" onclick="copyContractAddress()">
            📋 Copiar Endereço
          </button>
        </div>
      </div>
      
      <div class="verification-links-section">
        <h5>🚀 Acesso Direto à Verificação:</h5>
        <div class="verification-quick-links">
          <a href="${verificationDirectUrl}" target="_blank" class="btn-verification-direct">
            🔗 Verificar Contrato no ${networkName}
          </a>
          <a href="${contractExplorerUrl}" target="_blank" class="btn-contract-link">
            👁️ Ver Contrato no Explorer
          </a>
        </div>
        <p class="quick-tip">💡 <strong>Dica:</strong> O primeiro link te leva direto para a página de verificação do seu contrato!</p>
      </div>
      
      <div class="verification-steps">
        <h5>📝 Passo a passo:</h5>
        <ol>
          <li>Clique no link azul acima para ir direto à página de verificação</li>
          <li>Na página que abrir, preencha os dados usando os botões "Copiar" abaixo</li>
          <li>Cole o código fonte no campo "Enter the Solidity Contract Code"</li>
          <li>Configure as opções de compilação conforme mostrado</li>
          <li>Clique em "Verify and Publish"</li>
        </ol>
      </div>
      
      <div class="verification-data">
        <div class="data-group">
          <label>⚙️ Configurações do Compilador:</label>
          <div class="config-grid">
            <div><strong>Compiler Type:</strong> Solidity (Single file)</div>
            <div><strong>Compiler Version:</strong> ${contractData.compilerVersion}</div>
            <div><strong>Open Source License:</strong> No License (None)</div>
            <div><strong>Optimization:</strong> ${contractData.optimizationUsed ? 'Yes' : 'No'}</div>
            <div><strong>Runs:</strong> ${contractData.runs}</div>
            <div><strong>EVM Version:</strong> ${contractData.evmVersion}</div>
          </div>
        </div>
        
        <div class="data-group">
          <label>📄 Código Fonte Solidity:</label>
          <div class="copy-section">
            <textarea id="source-code-display" readonly>${contractData.sourceCode}</textarea>
            <button type="button" class="btn-copy" onclick="copySourceCode()">
              📋 Copiar Código Fonte
            </button>
          </div>
        </div>
        
        <div class="data-group">
          <label>⚙️ ABI (Opcional - uma linha só):</label>
          <div class="copy-section">
            <textarea id="abi-display" readonly>${contractData.abiSingleLine}</textarea>
            <button type="button" class="btn-copy" onclick="copyABI()">
              📋 Copiar ABI (Linha Única)
            </button>
          </div>
          <small style="color: #6c757d;">
            <strong>Nota:</strong> O ABI foi formatado em uma linha única para evitar erro "Multi-line input not supported"
          </small>
        </div>
      </div>
      
      <div class="verification-help">
        <h5>💡 Dicas importantes:</h5>
        <ul>
          <li>✅ Use EXATAMENTE a versão do compilador mostrada: <strong>${contractData.compilerVersion}</strong></li>
          <li>📋 Use os botões "Copiar" para evitar erros de digitação</li>
          <li>🔄 O processo pode demorar alguns minutos na rede</li>
          <li>📧 Algumas redes enviam email de confirmação</li>
          <li>🆔 O ABI é opcional, mas se usar, cole na linha única fornecida</li>
        </ul>
      </div>
    </div>
  `;
  
  updateVerificationStatus(htmlContent, 'manual');
  
  // Habilita próximo passo
  const nextButton = document.getElementById('next-step-5');
  if (nextButton) {
    nextButton.style.display = 'inline-block';
  }
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
  
  // ABI em linha única (formato correto para verificação)
  let abiSingleLine = '';
  if (window.contratoAbi && Array.isArray(window.contratoAbi)) {
    abiSingleLine = JSON.stringify(window.contratoAbi);
  }
  
  return {
    isValid: true,
    sourceCode: window.contratoSource,
    contractName: window.contratoName,
    compilerVersion: `v${window.resolvedCompilerVersion}+commit.73712a01`, // Versão corrigida
    optimizationUsed: false,
    runs: 200,
    evmVersion: 'cancun',
    abiSingleLine: abiSingleLine
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
/**
 * Mostra interface de verificação manual com todas as melhorias
 */
function showManualVerification(contractAddress, chainId, reason) {
  const contractData = getContractData();
  if (!contractData.isValid) {
    updateVerificationStatus('❌ Compile o contrato primeiro', 'error');
    return;
  }
  
  const apiConfig = VERIFICATION_APIS[chainId];
  const networkName = apiConfig ? apiConfig.name : 'Rede Atual';
  const explorerUrl = apiConfig ? apiConfig.explorer : '#';
  
  // URLs corretas para verificação direta no contrato específico
  const contractExplorerUrl = `${explorerUrl}/address/${contractAddress}`;
  const verificationDirectUrl = `${explorerUrl}/verifyContract?a=${contractAddress}`;
  
  updateVerificationStatus(`
    <div class="manual-verification">
      <div class="verification-info">
        <h4>📋 Verificação Manual de Contrato</h4>
        <p class="reason">ℹ️ ${reason}</p>
        <p>Tudo pronto! Use os dados abaixo para verificar seu contrato facilmente.</p>
      </div>
      
      <div class="contract-address-section">
        <h5>📍 Endereço do Contrato:</h5>
        <div class="copy-section">
          <input type="text" id="contract-address-display" value="${contractAddress}" readonly>
          <button type="button" class="btn-copy" onclick="copyContractAddress()">
            📋 Copiar Endereço
          </button>
        </div>
      </div>
      
      <div class="verification-links-section">
        <h5>🚀 Acesso Direto à Verificação:</h5>
        <div class="verification-quick-links">
          <a href="${verificationDirectUrl}" target="_blank" class="btn-verification-direct">
            🔗 Verificar Contrato no ${networkName}
          </a>
          <a href="${contractExplorerUrl}" target="_blank" class="btn-contract-link">
            👁️ Ver Contrato no Explorer
          </a>
        </div>
        <p class="quick-tip">💡 <strong>Dica:</strong> O primeiro link te leva direto para a página de verificação do seu contrato!</p>
      </div>
      
      <div class="verification-steps">
        <h5>� Passo a passo:</h5>
        <ol>
          <li>Clique no link azul acima para ir direto à página de verificação</li>
          <li>Na página que abrir, preencha os dados usando os botões "Copiar" abaixo</li>
          <li>Cole o código fonte no campo "Enter the Solidity Contract Code"</li>
          <li>Configure as opções de compilação conforme mostrado</li>
          <li>Clique em "Verify and Publish"</li>
        </ol>
      </div>
      
      <div class="verification-data">
        <div class="data-group">
          <label>⚙️ Configurações do Compilador:</label>
          <div class="config-grid">
            <div><strong>Compiler Type:</strong> Solidity (Single file)</div>
            <div><strong>Compiler Version:</strong> ${contractData.compilerVersion}</div>
            <div><strong>Open Source License:</strong> No License (None)</div>
            <div><strong>Optimization:</strong> ${contractData.optimizationUsed ? 'Yes' : 'No'}</div>
            ${contractData.optimizationUsed ? `<div><strong>Runs:</strong> ${contractData.runs}</div>` : ''}
            <div><strong>EVM Version:</strong> ${contractData.evmVersion}</div>
          </div>
        </div>
        
        <div class="data-group">
          <label>📄 Código Fonte Solidity:</label>
          <div class="copy-section">
            <textarea id="source-code-display" readonly>${contractData.sourceCode}</textarea>
            <button type="button" class="btn-copy" onclick="copySourceCode()">
              � Copiar Código Fonte
            </button>
          </div>
        </div>
        
        <div class="data-group">
          <label>⚙️ ABI (Opcional - uma linha só):</label>
          <div class="copy-section">
            <textarea id="abi-display" readonly>${contractData.abiSingleLine}</textarea>
            <button type="button" class="btn-copy" onclick="copyABI()">
              � Copiar ABI (Linha Única)
            </button>
          </div>
          <small style="color: #6c757d;">
            <strong>Nota:</strong> O ABI foi formatado em uma linha única para evitar erro "Multi-line input not supported"
          </small>
        </div>
      </div>
      
      <div class="verification-help">
        <h5>� Dicas importantes:</h5>
        <ul>
          <li>✅ Use EXATAMENTE a versão do compilador mostrada: <strong>${contractData.compilerVersion}</strong></li>
          <li>📋 Use os botões "Copiar" para evitar erros de digitação</li>
          <li>🔄 O processo pode demorar alguns minutos na rede</li>
          <li>📧 Algumas redes enviam email de confirmação</li>
          <li>🆔 O ABI é opcional, mas se usar, cole na linha única fornecida</li>
        </ul>
      </div>
    </div>
  `, 'manual');
  
  // Habilita próximo passo
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
    statusElement.className = 'verification-status ' + type;
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
window.copyContractAddress = function() {
  const input = document.getElementById('contract-address-display');
  input.select();
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
  const configText = 'Compiler Version: ' + contractData.compilerVersion + '\n' +
    'Optimization: ' + (contractData.optimizationUsed ? 'Yes' : 'No') + '\n' +
    'Runs: ' + contractData.runs + '\n' +
    'EVM Version: ' + contractData.evmVersion;
  
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
