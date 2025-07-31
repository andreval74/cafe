/**
 * SmartContract.Cafe - Interface do Modo Simples
 * JavaScript para gerenciar a interface e funcionalidade do modo simples
 */

class SimpleTokenInterface {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.deployedContract = null;
        this.web3Manager = null;
        
        this.init();
    }

    async init() {
        // Aguarda o Web3Manager estar disponível
        if (typeof window.Web3Manager !== 'undefined') {
            this.web3Manager = new window.Web3Manager();
            await this.web3Manager.init();
        }

        this.bindEvents();
        this.updateUI();
        this.loadFormState();
    }

    bindEvents() {
        // Navegação entre steps
        document.querySelectorAll('.step-nav button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'next') this.nextStep();
                if (action === 'prev') this.prevStep();
            });
        });

        // Botão conectar carteira
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectWallet());
        }

        // Formulário do step 1
        const tokenForm = document.getElementById('tokenForm');
        if (tokenForm) {
            tokenForm.addEventListener('input', () => this.validateStep1());
            tokenForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveFormData();
                this.nextStep();
            });
        }

        // Botão de deploy
        const deployBtn = document.getElementById('deployToken');
        if (deployBtn) {
            deployBtn.addEventListener('click', () => this.deployToken());
        }

        // Auto-save do formulário
        document.querySelectorAll('#tokenForm input').forEach(input => {
            input.addEventListener('input', () => this.saveFormState());
        });
    }

    async connectWallet() {
        try {
            if (!this.web3Manager) {
                throw new Error('Web3Manager não está disponível');
            }

            const connected = await this.web3Manager.connectWallet();
            
            if (connected) {
                this.updateConnectionStatus();
                this.showNotification('Carteira conectada com sucesso!', 'success');
                
                // Se estiver no step 2, pode prosseguir
                if (this.currentStep === 2) {
                    this.updateStepButtons();
                }
            }
        } catch (error) {
            console.error('Erro ao conectar carteira:', error);
            this.showNotification('Erro ao conectar carteira: ' + error.message, 'error');
        }
    }

    async updateConnectionStatus() {
        const statusCard = document.getElementById('connectionStatus');
        const walletInfo = document.getElementById('walletInfo');
        
        if (!statusCard || !walletInfo) return;

        if (this.web3Manager && this.web3Manager.isConnected) {
            const account = this.web3Manager.currentAccount;
            const network = this.web3Manager.currentNetwork;
            
            statusCard.className = 'connection-card connected';
            statusCard.innerHTML = `
                <div class="connection-icon">✅</div>
                <div class="connection-details">
                    <div class="connection-title">Carteira Conectada</div>
                    <div class="connection-address">${this.formatAddress(account)}</div>
                    <div class="connection-network">${network.name}</div>
                </div>
            `;
            
            // Atualiza info na sidebar
            walletInfo.innerHTML = `
                <h4>Carteira Conectada</h4>
                <p><strong>Endereço:</strong><br>${this.formatAddress(account)}</p>
                <p><strong>Rede:</strong> ${network.name}</p>
                <p><strong>Taxa estimada:</strong> ~0.005 ETH</p>
            `;
        } else {
            statusCard.className = 'connection-card disconnected';
            statusCard.innerHTML = `
                <div class="connection-icon">❌</div>
                <div class="connection-details">
                    <div class="connection-title">Carteira Desconectada</div>
                    <div class="connection-subtitle">Clique para conectar</div>
                </div>
            `;
            
            walletInfo.innerHTML = `
                <h4>Conecte sua Carteira</h4>
                <p>Para criar seu token, você precisa conectar uma carteira Web3 como MetaMask.</p>
                <p>O custo estimado é de ~0.005 ETH para deploy na rede Ethereum.</p>
            `;
        }
    }

    validateStep1() {
        const tokenName = document.getElementById('tokenName')?.value.trim();
        const tokenSymbol = document.getElementById('tokenSymbol')?.value.trim();
        const totalSupply = document.getElementById('totalSupply')?.value;
        
        const errors = [];
        
        // Validação nome
        if (!tokenName || tokenName.length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }
        if (tokenName && tokenName.length > 50) {
            errors.push('Nome deve ter no máximo 50 caracteres');
        }
        
        // Validação símbolo
        if (!tokenSymbol || tokenSymbol.length < 2) {
            errors.push('Símbolo deve ter pelo menos 2 caracteres');
        }
        if (tokenSymbol && tokenSymbol.length > 10) {
            errors.push('Símbolo deve ter no máximo 10 caracteres');
        }
        if (tokenSymbol && !/^[A-Z0-9]+$/.test(tokenSymbol)) {
            errors.push('Símbolo deve conter apenas letras maiúsculas e números');
        }
        
        // Validação supply
        if (!totalSupply || isNaN(totalSupply) || totalSupply <= 0) {
            errors.push('Total supply deve ser um número positivo');
        }
        if (totalSupply && totalSupply > 999999999999999) {
            errors.push('Total supply muito alto');
        }
        
        // Atualiza UI de validação
        this.updateValidationUI(errors);
        
        return errors.length === 0;
    }

    updateValidationUI(errors) {
        const errorContainer = document.getElementById('validationErrors');
        if (!errorContainer) return;
        
        if (errors.length > 0) {
            errorContainer.innerHTML = `
                <div class="validation-errors">
                    ${errors.map(error => `<div class="error-item">❌ ${error}</div>`).join('')}
                </div>
            `;
            errorContainer.style.display = 'block';
        } else {
            errorContainer.style.display = 'none';
        }
        
        // Atualiza estado do botão
        this.updateStepButtons();
    }

    saveFormData() {
        this.formData = {
            tokenName: document.getElementById('tokenName')?.value.trim(),
            tokenSymbol: document.getElementById('tokenSymbol')?.value.trim().toUpperCase(),
            totalSupply: document.getElementById('totalSupply')?.value,
            owner: this.web3Manager?.currentAccount || '',
            isPremium: false // Modo simples sempre é gratuito
        };
    }

    saveFormState() {
        const formState = {
            tokenName: document.getElementById('tokenName')?.value || '',
            tokenSymbol: document.getElementById('tokenSymbol')?.value || '',
            totalSupply: document.getElementById('totalSupply')?.value || ''
        };
        
        localStorage.setItem('smartcontract_cafe_simple_form', JSON.stringify(formState));
    }

    loadFormState() {
        try {
            const saved = localStorage.getItem('smartcontract_cafe_simple_form');
            if (saved) {
                const formState = JSON.parse(saved);
                
                if (document.getElementById('tokenName')) {
                    document.getElementById('tokenName').value = formState.tokenName || '';
                }
                if (document.getElementById('tokenSymbol')) {
                    document.getElementById('tokenSymbol').value = formState.tokenSymbol || '';
                }
                if (document.getElementById('totalSupply')) {
                    document.getElementById('totalSupply').value = formState.totalSupply || '';
                }
                
                // Re-valida após carregar
                setTimeout(() => this.validateStep1(), 100);
            }
        } catch (error) {
            console.error('Erro ao carregar estado do formulário:', error);
        }
    }

    nextStep() {
        if (this.currentStep === 1 && !this.validateStep1()) {
            this.showNotification('Por favor, corrija os erros no formulário', 'error');
            return;
        }
        
        if (this.currentStep === 2 && (!this.web3Manager || !this.web3Manager.isConnected)) {
            this.showNotification('Por favor, conecte sua carteira primeiro', 'error');
            return;
        }
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateUI();
            
            // Salva dados quando sair do step 1
            if (this.currentStep === 2) {
                this.saveFormData();
                this.updateTokenPreview();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
        }
    }

    updateUI() {
        // Atualiza indicador de progresso
        this.updateProgressBar();
        
        // Mostra/esconde steps
        this.updateStepVisibility();
        
        // Atualiza botões
        this.updateStepButtons();
        
        // Atualiza status de conexão se estiver no step 2
        if (this.currentStep === 2) {
            this.updateConnectionStatus();
        }
    }

    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        const progressSteps = document.querySelectorAll('.progress-step');
        
        if (progressFill) {
            const percentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        
        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber <= this.currentStep);
            step.classList.toggle('completed', stepNumber < this.currentStep);
        });
    }

    updateStepVisibility() {
        document.querySelectorAll('.step-content').forEach((step, index) => {
            const stepNumber = index + 1;
            step.style.display = stepNumber === this.currentStep ? 'block' : 'none';
        });
    }

    updateStepButtons() {
        const prevBtn = document.querySelector('[data-action="prev"]');
        const nextBtn = document.querySelector('[data-action="next"]');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        }
        
        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'inline-block';
                
                // Verifica se pode prosseguir
                let canProceed = true;
                
                if (this.currentStep === 1) {
                    canProceed = this.validateStep1();
                } else if (this.currentStep === 2) {
                    canProceed = this.web3Manager && this.web3Manager.isConnected;
                }
                
                nextBtn.disabled = !canProceed;
            }
        }
    }

    updateTokenPreview() {
        const previewContainer = document.getElementById('tokenPreview');
        if (!previewContainer || !this.formData) return;
        
        const tokenName = this.formData.tokenName + ' cafe';
        const tokenSymbol = this.formData.tokenSymbol + 'cafe';
        
        previewContainer.innerHTML = `
            <h4>Seu Token:</h4>
            <div class="token-preview-item">
                <strong>Nome:</strong> ${tokenName}
            </div>
            <div class="token-preview-item">
                <strong>Símbolo:</strong> ${tokenSymbol}
            </div>
            <div class="token-preview-item">
                <strong>Supply Total:</strong> ${this.formatNumber(this.formData.totalSupply)}
            </div>
            <div class="token-preview-item">
                <strong>Tipo:</strong> ERC-20 Básico
            </div>
            <div class="token-preview-note">
                <small>💡 Este token inclui o sufixo "cafe" por ser criado no modo gratuito</small>
            </div>
        `;
    }

    async deployToken() {
        try {
            if (!this.web3Manager || !this.web3Manager.isConnected) {
                throw new Error('Carteira não conectada');
            }

            if (!window.basicTokenTemplate) {
                throw new Error('Template de token não carregado');
            }

            // Atualiza dados do owner
            this.formData.owner = this.web3Manager.currentAccount;

            // Prepara dados para deploy
            const deployData = window.basicTokenTemplate.prepareDeployData(this.formData);
            
            // Mostra loading
            this.showDeployProgress('Preparando deploy...');
            
            // Estima gas
            const gasEstimate = await this.estimateDeployGas(deployData);
            
            this.showDeployProgress('Enviando transação...');
            
            // Realiza deploy
            const contractAddress = await this.performDeploy(deployData, gasEstimate);
            
            this.showDeployProgress('Verificando contrato...');
            
            // Salva informações do contrato
            this.deployedContract = {
                address: contractAddress,
                ...this.formData,
                deployedAt: new Date().toISOString(),
                network: this.web3Manager.currentNetwork.name,
                txHash: contractAddress // será substituído pelo hash real
            };

            // Atualiza UI de sucesso
            this.showDeploySuccess();
            
            // Salva no histórico
            this.saveToHistory();

        } catch (error) {
            console.error('Erro no deploy:', error);
            this.showDeployError(error.message);
        }
    }

    async estimateDeployGas(deployData) {
        // Placeholder para estimativa de gas
        // Em implementação real, usaria o provider para estimar
        return {
            gasLimit: '2000000',
            gasPrice: await this.web3Manager.provider.getGasPrice()
        };
    }

    async performDeploy(deployData, gasEstimate) {
        // Placeholder para deploy real
        // Em implementação real, compilaria e deployaria o contrato
        
        // Simula delay de deploy
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Simula endereço do contrato deployado
        return '0x' + Math.random().toString(16).substr(2, 40);
    }

    showDeployProgress(message) {
        const deployBtn = document.getElementById('deployToken');
        const progressDiv = document.getElementById('deployProgress');
        
        if (deployBtn) {
            deployBtn.disabled = true;
            deployBtn.innerHTML = '⏳ Criando...';
        }
        
        if (progressDiv) {
            progressDiv.innerHTML = `
                <div class="deploy-progress">
                    <div class="spinner"></div>
                    <span>${message}</span>
                </div>
            `;
            progressDiv.style.display = 'block';
        }
    }

    showDeploySuccess() {
        const progressDiv = document.getElementById('deployProgress');
        const successDiv = document.getElementById('deploySuccess');
        
        if (progressDiv) {
            progressDiv.style.display = 'none';
        }
        
        if (successDiv && this.deployedContract) {
            successDiv.innerHTML = `
                <div class="deploy-success">
                    <div class="success-icon">🎉</div>
                    <h3>Token Criado com Sucesso!</h3>
                    <div class="contract-info">
                        <div class="info-item">
                            <strong>Nome:</strong> ${this.formData.tokenName} cafe
                        </div>
                        <div class="info-item">
                            <strong>Símbolo:</strong> ${this.formData.tokenSymbol}cafe
                        </div>
                        <div class="info-item">
                            <strong>Endereço:</strong> 
                            <code>${this.deployedContract.address}</code>
                        </div>
                        <div class="info-item">
                            <strong>Rede:</strong> ${this.deployedContract.network}
                        </div>
                    </div>
                    <div class="success-actions">
                        <button onclick="this.copyContractAddress()" class="btn btn-secondary">
                            📋 Copiar Endereço
                        </button>
                        <button onclick="this.addToWallet()" class="btn btn-primary">
                            🦊 Adicionar à MetaMask
                        </button>
                        <button onclick="this.createNewToken()" class="btn btn-outline">
                            ➕ Criar Outro Token
                        </button>
                    </div>
                </div>
            `;
            successDiv.style.display = 'block';
        }
        
        this.showNotification('Token criado com sucesso! 🎉', 'success');
    }

    showDeployError(errorMessage) {
        const deployBtn = document.getElementById('deployToken');
        const progressDiv = document.getElementById('deployProgress');
        
        if (deployBtn) {
            deployBtn.disabled = false;
            deployBtn.innerHTML = '🚀 Criar Token';
        }
        
        if (progressDiv) {
            progressDiv.innerHTML = `
                <div class="deploy-error">
                    <div class="error-icon">❌</div>
                    <div class="error-message">${errorMessage}</div>
                    <button onclick="simpleInterface.deployToken()" class="btn btn-primary">
                        🔄 Tentar Novamente
                    </button>
                </div>
            `;
        }
        
        this.showNotification('Erro ao criar token: ' + errorMessage, 'error');
    }

    copyContractAddress() {
        if (this.deployedContract) {
            navigator.clipboard.writeText(this.deployedContract.address);
            this.showNotification('Endereço copiado!', 'success');
        }
    }

    async addToWallet() {
        if (!this.deployedContract || !this.web3Manager) return;
        
        try {
            await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: this.deployedContract.address,
                        symbol: this.formData.tokenSymbol + 'cafe',
                        decimals: 18,
                    },
                },
            });
            
            this.showNotification('Token adicionado à MetaMask!', 'success');
        } catch (error) {
            this.showNotification('Erro ao adicionar token: ' + error.message, 'error');
        }
    }

    createNewToken() {
        // Limpa dados
        this.formData = {};
        this.deployedContract = null;
        this.currentStep = 1;
        
        // Limpa formulário
        document.getElementById('tokenForm')?.reset();
        
        // Limpa localStorage
        localStorage.removeItem('smartcontract_cafe_simple_form');
        
        // Reseta UI
        document.getElementById('deploySuccess').style.display = 'none';
        document.getElementById('deployProgress').style.display = 'none';
        
        this.updateUI();
        this.showNotification('Pronto para criar um novo token!', 'info');
    }

    saveToHistory() {
        try {
            const history = JSON.parse(localStorage.getItem('smartcontract_cafe_history') || '[]');
            history.unshift(this.deployedContract);
            
            // Mantém apenas os últimos 10
            if (history.length > 10) {
                history.splice(10);
            }
            
            localStorage.setItem('smartcontract_cafe_history', JSON.stringify(history));
        } catch (error) {
            console.error('Erro ao salvar histórico:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Cria elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.remove()">×</button>
        `;
        
        // Adiciona ao container
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.simpleInterface = new SimpleTokenInterface();
});

// Exporta para uso global
window.SimpleTokenInterface = SimpleTokenInterface;
