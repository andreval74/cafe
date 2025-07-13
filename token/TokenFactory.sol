// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Interface do TokenImplementation
interface ITokenImplementation {
    function initialize(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        address _owner
    ) external;
    
    function getTokenInfo() external view returns (
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        address _owner,
        bool _initialized
    );
}

/**
 * @title TokenFactory
 * @dev Factory para criar clones de tokens usando EIP-1167 (Minimal Proxy)
 * Reduz o custo de deploy em ~90% comparado ao deploy normal
 */
contract TokenFactory is Ownable, ReentrancyGuard {
    using Clones for address;
    
    // ===== STATE VARIABLES =====
    
    // Endereço do contrato implementation (base)
    address public immutable implementation;
    
    // Array de todos os tokens criados
    address[] public allTokens;
    
    // Mapping para verificar se um endereço é um token criado por este factory
    mapping(address => bool) public isTokenFromFactory;
    
    // Mapping de owner para seus tokens
    mapping(address => address[]) public tokensByOwner;
    
    // Taxa de criação (em wei) - pode ser 0
    uint256 public creationFee;
    
    // Endereço para receber as taxas
    address public feeRecipient;
    
    // ===== EVENTS =====
    
    event TokenCreated(
        address indexed token,
        address indexed owner,
        string name,
        string symbol,
        uint8 decimals,
        uint256 totalSupply
    );
    
    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    
    // ===== CONSTRUCTOR =====
    
    /**
     * @dev Construtor do factory
     * @param _implementation Endereço do contrato TokenImplementation deployado
     */
    constructor(address _implementation) {
        require(_implementation != address(0), "Implementation cannot be zero address");
        implementation = _implementation;
        feeRecipient = msg.sender;
    }
    
    // ===== MAIN FUNCTIONS =====
    
    /**
     * @dev Cria um novo token clone
     * @param name Nome do token
     * @param symbol Símbolo do token
     * @param decimals Número de decimais
     * @param totalSupply Supply total (em unidades inteiras)
     * @param owner Endereço do proprietário do token
     * @return tokenAddress Endereço do token criado
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply,
        address owner
    ) external payable nonReentrant returns (address tokenAddress) {
        // Verificar taxa de criação
        require(msg.value >= creationFee, "Insufficient creation fee");
        
        // Validações básicas
        require(owner != address(0), "Owner cannot be zero address");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(totalSupply > 0, "Total supply must be greater than 0");
        require(decimals <= 18, "Decimals cannot exceed 18");
        
        // Criar clone do implementation
        tokenAddress = implementation.clone();
        
        // Inicializar o clone
        ITokenImplementation(tokenAddress).initialize(
            name,
            symbol,
            decimals,
            totalSupply,
            owner
        );
        
        // Registrar o token
        allTokens.push(tokenAddress);
        isTokenFromFactory[tokenAddress] = true;
        tokensByOwner[owner].push(tokenAddress);
        
        // Transferir taxa se houver
        if (msg.value > 0 && feeRecipient != address(0)) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit TokenCreated(tokenAddress, owner, name, symbol, decimals, totalSupply);
        
        return tokenAddress;
    }
    
    /**
     * @dev Cria múltiplos tokens em uma única transação
     * @param tokenData Array com os dados dos tokens
     * @return tokenAddresses Array com os endereços dos tokens criados
     */
    function createMultipleTokens(
        TokenData[] memory tokenData
    ) external payable nonReentrant returns (address[] memory tokenAddresses) {
        require(tokenData.length > 0, "No token data provided");
        require(tokenData.length <= 10, "Too many tokens (max 10)");
        require(msg.value >= creationFee * tokenData.length, "Insufficient creation fee");
        
        tokenAddresses = new address[](tokenData.length);
        
        for (uint256 i = 0; i < tokenData.length; i++) {
            TokenData memory data = tokenData[i];
            
            // Validações
            require(data.owner != address(0), "Owner cannot be zero address");
            require(bytes(data.name).length > 0, "Name cannot be empty");
            require(bytes(data.symbol).length > 0, "Symbol cannot be empty");
            require(data.totalSupply > 0, "Total supply must be greater than 0");
            require(data.decimals <= 18, "Decimals cannot exceed 18");
            
            // Criar clone
            address tokenAddress = implementation.clone();
            
            // Inicializar
            ITokenImplementation(tokenAddress).initialize(
                data.name,
                data.symbol,
                data.decimals,
                data.totalSupply,
                data.owner
            );
            
            // Registrar
            allTokens.push(tokenAddress);
            isTokenFromFactory[tokenAddress] = true;
            tokensByOwner[data.owner].push(tokenAddress);
            
            tokenAddresses[i] = tokenAddress;
            
            emit TokenCreated(
                tokenAddress,
                data.owner,
                data.name,
                data.symbol,
                data.decimals,
                data.totalSupply
            );
        }
        
        // Transferir taxa
        if (msg.value > 0 && feeRecipient != address(0)) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        return tokenAddresses;
    }
    
    // ===== VIEW FUNCTIONS =====
    
    /**
     * @dev Retorna o número total de tokens criados
     */
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }
    
    /**
     * @dev Retorna todos os tokens criados por um owner
     */
    function getTokensByOwner(address owner) external view returns (address[] memory) {
        return tokensByOwner[owner];
    }
    
    /**
     * @dev Retorna informações de um token específico
     */
    function getTokenInfo(address tokenAddress) external view returns (
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply,
        address owner,
        bool initialized
    ) {
        require(isTokenFromFactory[tokenAddress], "Token not from this factory");
        return ITokenImplementation(tokenAddress).getTokenInfo();
    }
    
    /**
     * @dev Retorna uma página de tokens criados
     */
    function getTokensPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory tokens) {
        require(offset < allTokens.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > allTokens.length) {
            end = allTokens.length;
        }
        
        tokens = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            tokens[i - offset] = allTokens[i];
        }
        
        return tokens;
    }
    
    /**
     * @dev Calcula o custo total para criar N tokens
     */
    function calculateCreationCost(uint256 tokenCount) external view returns (uint256) {
        return creationFee * tokenCount;
    }
    
    // ===== ADMIN FUNCTIONS =====
    
    /**
     * @dev Atualiza a taxa de criação (apenas owner)
     */
    function setCreationFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = creationFee;
        creationFee = _newFee;
        emit CreationFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Atualiza o destinatário das taxas (apenas owner)
     */
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Fee recipient cannot be zero address");
        address oldRecipient = feeRecipient;
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(oldRecipient, _newRecipient);
    }
    
    /**
     * @dev Permite ao owner retirar ETH acumulado
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // ===== STRUCTS =====
    
    struct TokenData {
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
        address owner;
    }
    
    // ===== FALLBACK =====
    
    /**
     * @dev Permite receber ETH
     */
    receive() external payable {}
}

