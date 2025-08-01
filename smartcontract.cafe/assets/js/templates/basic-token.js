/**
 * SmartContract.Cafe - Template de Token Básico
 * Baseado em OpenZeppelin com sufixo "cafe" para versão gratuita
 */

// Template Solidity para token básico
const BASIC_TOKEN_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title {{TOKEN_NAME}}
 * @dev Token ERC20 criado na SmartContract.Cafe
 * @notice Este token foi criado usando nosso modo simples gratuito
 */
contract {{CONTRACT_NAME}} is ERC20, Ownable {
    /**
     * @dev Construtor que define o nome, símbolo e supply inicial
     * @param initialOwner Endereço que receberá a propriedade do contrato
     */
    constructor(address initialOwner) 
        ERC20("{{TOKEN_NAME}}", "{{TOKEN_SYMBOL}}") 
        Ownable(initialOwner)
    {
        // Minta o supply total para o proprietário
        _mint(initialOwner, {{TOTAL_SUPPLY}} * 10**decimals());
    }

    /**
     * @dev Função para cunhar novos tokens (apenas proprietário)
     * @param to Endereço que receberá os tokens
     * @param amount Quantidade de tokens a serem cunhados
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Informações sobre o criador do token
     * @return string URL da plataforma de criação
     */
    function createdBy() public pure returns (string memory) {
        return "SmartContract.Cafe - Token criado no modo simples";
    }

    /**
     * @dev Versão do template usado
     * @return string Versão do template
     */
    function templateVersion() public pure returns (string memory) {
        return "1.0.0-cafe";
    }
}`;

// Bytecode pré-compilado (seria gerado pela compilação real)
const BASIC_TOKEN_BYTECODE = "0x608060405234801561001057600080fd5b5"; // Placeholder

// ABI do contrato básico
const BASIC_TOKEN_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "initialOwner",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "createdBy",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "templateVersion",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

/**
 * Classe para gerenciar templates de tokens básicos
 */
class BasicTokenTemplate {
    constructor() {
        this.template = BASIC_TOKEN_SOLIDITY;
        this.abi = BASIC_TOKEN_ABI;
        this.bytecode = BASIC_TOKEN_BYTECODE;
    }

    /**
     * Gera o código Solidity personalizado do token
     * @param {Object} config - Configuração do token
     * @returns {string} - Código Solidity gerado
     */
    generateCode(config) {
        let code = this.template;
        
        // Aplica sufixo "cafe" para versão gratuita
        const tokenName = config.tokenName + (config.isPremium ? '' : ' cafe');
        const tokenSymbol = config.tokenSymbol + (config.isPremium ? '' : 'cafe');
        const contractName = this.sanitizeContractName(config.tokenName) + 'Token';
        
        // Substitui placeholders
        code = code.replace(/\{\{TOKEN_NAME\}\}/g, tokenName);
        code = code.replace(/\{\{TOKEN_SYMBOL\}\}/g, tokenSymbol);
        code = code.replace(/\{\{CONTRACT_NAME\}\}/g, contractName);
        code = code.replace(/\{\{TOTAL_SUPPLY\}\}/g, config.totalSupply);
        
        return code;
    }

    /**
     * Sanitiza o nome para uso como nome de contrato
     * @param {string} name - Nome do token
     * @returns {string} - Nome sanitizado
     */
    sanitizeContractName(name) {
        return name
            .replace(/[^a-zA-Z0-9]/g, '')
            .replace(/^\d/, '_$&') // Adiciona _ se começar com número
            .substring(0, 30); // Limita tamanho
    }

    /**
     * Valida a configuração do token
     * @param {Object} config - Configuração do token
     * @returns {Object} - Resultado da validação
     */
    validateConfig(config) {
        const errors = [];
        
        // Validação do nome
        if (!config.tokenName || config.tokenName.trim().length < 2) {
            errors.push('Nome do token deve ter pelo menos 2 caracteres');
        }
        
        if (config.tokenName && config.tokenName.length > 50) {
            errors.push('Nome do token deve ter no máximo 50 caracteres');
        }
        
        // Validação do símbolo
        if (!config.tokenSymbol || config.tokenSymbol.trim().length < 2) {
            errors.push('Símbolo do token deve ter pelo menos 2 caracteres');
        }
        
        if (config.tokenSymbol && config.tokenSymbol.length > 10) {
            errors.push('Símbolo do token deve ter no máximo 10 caracteres');
        }
        
        // Validação do símbolo (apenas letras e números)
        if (config.tokenSymbol && !/^[A-Z0-9]+$/.test(config.tokenSymbol)) {
            errors.push('Símbolo deve conter apenas letras maiúsculas e números');
        }
        
        // Validação do supply
        if (!config.totalSupply || isNaN(config.totalSupply) || config.totalSupply <= 0) {
            errors.push('Total supply deve ser um número positivo');
        }
        
        // Validação do supply máximo
        if (config.totalSupply && config.totalSupply > 999999999999999) {
            errors.push('Total supply muito alto (máx: 999,999,999,999,999)');
        }
        
        // Validação do owner
        if (!config.owner || !ethers.utils.isAddress(config.owner)) {
            errors.push('Endereço do proprietário inválido');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Prepara dados para deploy
     * @param {Object} config - Configuração do token
     * @returns {Object} - Dados para deploy
     */
    prepareDeployData(config) {
        const validation = this.validateConfig(config);
        
        if (!validation.isValid) {
            throw new Error(`Configuração inválida: ${validation.errors.join(', ')}`);
        }
        
        const code = this.generateCode(config);
        
        return {
            sourceCode: code,
            contractName: this.sanitizeContractName(config.tokenName) + 'Token',
            constructorArgs: [config.owner],
            abi: this.abi,
            compilerVersion: 'v0.8.20+commit.a1b79de6',
            optimization: true,
            optimizationRuns: 200,
            evmVersion: 'paris'
        };
    }

    /**
     * Gera dados de verificação para block explorer
     * @param {Object} config - Configuração do token
     * @param {string} contractAddress - Endereço do contrato deployado
     * @returns {Object} - Dados para verificação
     */
    getVerificationData(config, contractAddress) {
        const deployData = this.prepareDeployData(config);
        
        return {
            contractAddress: contractAddress,
            sourceCode: deployData.sourceCode,
            contractName: deployData.contractName,
            compilerVersion: deployData.compilerVersion,
            optimization: deployData.optimization,
            optimizationRuns: deployData.optimizationRuns,
            constructorArguments: deployData.constructorArgs,
            evmVersion: deployData.evmVersion,
            licenseType: 'MIT',
            abi: JSON.stringify(deployData.abi)
        };
    }
}

// Exporta a classe e constantes
window.BasicTokenTemplate = BasicTokenTemplate;
window.BASIC_TOKEN_ABI = BASIC_TOKEN_ABI;
window.BASIC_TOKEN_SOLIDITY = BASIC_TOKEN_SOLIDITY;

// Instância global
window.basicTokenTemplate = new BasicTokenTemplate();
