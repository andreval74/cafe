/**
 * SmartContract.Cafe - Web3 Manager
 * Gerencia conexões com carteiras e interações blockchain
 */

class Web3Manager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.chainId = null;
        this.isConnected = false;
        
        // Event listeners
        this.onAccountChange = null;
        this.onChainChange = null;
        
        this.init();
    }

    async init() {
        // Verifica se já está conectado
        if (window.ethereum) {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Event listeners do MetaMask
            window.ethereum.on('accountsChanged', (accounts) => {
                this.handleAccountsChanged(accounts);
            });
            
            window.ethereum.on('chainChanged', (chainId) => {
                this.handleChainChanged(chainId);
            });
            
            // Verifica se já está conectado
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            
            if (accounts.length > 0) {
                await this.setAccount(accounts[0]);
            }
        }
        
        this.updateUI();
    }

    async connectWallet() {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask não detectado! Por favor, instale o MetaMask.');
            }

            // Solicita conexão
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('Nenhuma conta encontrada no MetaMask.');
            }

            await this.setAccount(accounts[0]);
            
            this.showSuccess('✅ Carteira conectada com sucesso!');
            return true;
            
        } catch (error) {
            console.error('Erro ao conectar carteira:', error);
            this.showError(error.message);
            return false;
        }
    }

    async setAccount(account) {
        this.account = account;
        this.signer = this.provider.getSigner();
        this.chainId = await this.provider.getNetwork().then(n => n.chainId);
        this.isConnected = true;
        
        if (this.onAccountChange) {
            this.onAccountChange(account, this.chainId);
        }
        
        this.updateUI();
    }

    async switchNetwork(targetChainId) {
        try {
            const chainIdHex = '0x' + targetChainId.toString(16);
            
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            });
            
            return true;
        } catch (error) {
            if (error.code === 4902) {
                // Rede não adicionada, tentar adicionar
                return await this.addNetwork(targetChainId);
            }
            console.error('Erro ao trocar rede:', error);
            return false;
        }
    }

    async addNetwork(chainId) {
        const networks = this.getSupportedNetworks();
        const network = networks[chainId];
        
        if (!network) {
            this.showError('Rede não suportada');
            return false;
        }

        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [network],
            });
            return true;
        } catch (error) {
            console.error('Erro ao adicionar rede:', error);
            return false;
        }
    }

    getSupportedNetworks() {
        return {
            1: {
                chainId: '0x1',
                chainName: 'Ethereum Mainnet',
                nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: ['https://eth-mainnet.public.blastapi.io'],
                blockExplorerUrls: ['https://etherscan.io']
            },
            56: {
                chainId: '0x38',
                chainName: 'BNB Smart Chain',
                nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                },
                rpcUrls: ['https://bsc-dataseed.binance.org'],
                blockExplorerUrls: ['https://bscscan.com']
            },
            137: {
                chainId: '0x89',
                chainName: 'Polygon',
                nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                },
                rpcUrls: ['https://polygon-rpc.com'],
                blockExplorerUrls: ['https://polygonscan.com']
            },
            42161: {
                chainId: '0xa4b1',
                chainName: 'Arbitrum One',
                nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: ['https://arb1.arbitrum.io/rpc'],
                blockExplorerUrls: ['https://arbiscan.io']
            },
            10: {
                chainId: '0xa',
                chainName: 'Optimism',
                nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: ['https://mainnet.optimism.io'],
                blockExplorerUrls: ['https://optimistic.etherscan.io']
            },
            8453: {
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org']
            }
        };
    }

    getNetworkInfo(chainId) {
        const networks = {
            1: { name: 'Ethereum', symbol: 'ETH', explorer: 'etherscan.io' },
            56: { name: 'BSC', symbol: 'BNB', explorer: 'bscscan.com' },
            137: { name: 'Polygon', symbol: 'MATIC', explorer: 'polygonscan.com' },
            42161: { name: 'Arbitrum', symbol: 'ETH', explorer: 'arbiscan.io' },
            10: { name: 'Optimism', symbol: 'ETH', explorer: 'optimistic.etherscan.io' },
            8453: { name: 'Base', symbol: 'ETH', explorer: 'basescan.org' }
        };
        
        return networks[chainId] || { name: 'Unknown', symbol: 'ETH', explorer: 'etherscan.io' };
    }

    async getBalance() {
        if (!this.isConnected) return '0';
        
        try {
            const balance = await this.provider.getBalance(this.account);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error('Erro ao obter saldo:', error);
            return '0';
        }
    }

    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.disconnect();
        } else {
            this.setAccount(accounts[0]);
        }
    }

    handleChainChanged(chainId) {
        this.chainId = parseInt(chainId, 16);
        
        if (this.onChainChange) {
            this.onChainChange(this.chainId);
        }
        
        this.updateUI();
    }

    disconnect() {
        this.account = null;
        this.signer = null;
        this.chainId = null;
        this.isConnected = false;
        this.updateUI();
    }

    updateUI() {
        // Atualiza botão de conexão
        const connectBtn = document.getElementById('connect-wallet');
        if (connectBtn) {
            if (this.isConnected) {
                const shortAddress = `${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
                const networkInfo = this.getNetworkInfo(this.chainId);
                connectBtn.innerHTML = `🟢 ${shortAddress} (${networkInfo.name})`;
                connectBtn.style.background = 'var(--tech-green)';
            } else {
                connectBtn.innerHTML = '🦊 Conectar Carteira';
                connectBtn.style.background = 'var(--tech-gradient)';
            }
        }

        // Atualiza campos de endereço do proprietário
        const ownerInputs = document.querySelectorAll('[id*="owner"], [id*="Owner"]');
        ownerInputs.forEach(input => {
            if (this.isConnected) {
                input.value = this.account;
                input.style.background = 'var(--coffee-light)';
            } else {
                input.value = '';
                input.style.background = '';
            }
        });

        // Atualiza status da rede
        const networkDisplays = document.querySelectorAll('.network-status');
        networkDisplays.forEach(display => {
            if (this.isConnected) {
                const networkInfo = this.getNetworkInfo(this.chainId);
                display.innerHTML = `🌐 ${networkInfo.name}`;
                display.style.color = 'var(--tech-green)';
            } else {
                display.innerHTML = '🔴 Desconectado';
                display.style.color = 'var(--gray-500)';
            }
        });
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Remove notificação anterior se existir
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Cria nova notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Adiciona CSS inline para notificação
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--tech-green)' : type === 'error' ? '#dc3545' : 'var(--tech-blue)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;

        // Adiciona animação CSS
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Inicializa o Web3Manager globalmente
window.web3Manager = new Web3Manager();

// Event listener para botão de conexão
document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connect-wallet');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            if (window.web3Manager.isConnected) {
                // Se já conectado, mostrar opções
                window.web3Manager.showNotification('Carteira já conectada! Use o painel para gerenciar.', 'info');
            } else {
                window.web3Manager.connectWallet();
            }
        });
    }
});

// Exporta para uso em outros módulos
window.Web3Manager = Web3Manager;
