// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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
 * @title TokenFactoryCreate2
 * @dev Factory híbrido que combina EIP-1167 (clonagem) com CREATE2 (personalização de endereço)
 * Oferece o melhor dos dois mundos: economia de gas + endereços personalizados
 */
contract TokenFactoryCreate2 is Ownable, ReentrancyGuard {
    
    // ===== STATE VARIABLES =====
    
    // Endereço do contrato implementation (base)
    address public immutable implementation;
    
    // Array de todos os tokens criados
    address[] public allTokens;
    
    // Mapping para verificar se um endereço é um token criado por este factory
    mapping(address => bool) public isTokenFromFactory;
    
    // Mapping de owner para seus tokens
    mapping(address => address[]) public tokensByOwner;
    
    // Mapping de SALT para endereço deployado (evitar reutilização)
    mapping(bytes32 => address) public saltToAddress;
    
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
        uint256 totalSupply,
        bytes32 salt
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
     * @dev Cria um novo token clone usando CREATE2 para endereço personalizado
     * @param name Nome do token
     * @param symbol Símbolo do token
     * @param decimals Número de decimais
     * @param totalSupply Supply total (em unidades inteiras)
     * @param owner Endereço do proprietário do token
     * @param salt SALT para personalização do endereço
     * @return tokenAddress Endereço do token criado
     */
    function createTokenWithSalt(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply,
        address owner,
        bytes32 salt
    ) external payable nonReentrant returns (address tokenAddress) {
        // Verificar taxa de criação
        require(msg.value >= creationFee, "Insufficient creation fee");
        
        // Validações básicas
        require(owner != address(0), "Owner cannot be zero address");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(totalSupply > 0, "Total supply must be greater than 0");
        require(decimals <= 18, "Decimals cannot exceed 18");
        require(saltToAddress[salt] == address(0), "Salt already used");
        
        // Criar clone usando CREATE2
        tokenAddress = cloneCreate2(implementation, salt);
        
        // Verificar se o deploy foi bem-sucedido
        require(tokenAddress != address(0), "Clone creation failed");
        
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
        saltToAddress[salt] = tokenAddress;
        
        // Transferir taxa se houver
        if (msg.value > 0 && feeRecipient != address(0)) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit TokenCreated(tokenAddress, owner, name, symbol, decimals, totalSupply, salt);
        
        return tokenAddress;
    }
    
    /**
     * @dev Cria um novo token clone usando CREATE normal (sem personalização)
     * Mais barato em gas, mas endereço não é personalizável
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
        
        // Criar clone usando CREATE normal
        tokenAddress = clone(implementation);
        
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
        
        emit TokenCreated(tokenAddress, owner, name, symbol, decimals, totalSupply, bytes32(0));
        
        return tokenAddress;
    }
    
    // ===== PREDICTION FUNCTIONS =====
    
    /**
     * @dev Calcula o endereço que seria criado com um determinado SALT
     * @param salt SALT para o cálculo
     * @return predictedAddress Endereço que seria criado
     */
    function predictTokenAddress(bytes32 salt) external view returns (address predictedAddress) {
        return predictCreate2Address(implementation, salt);
    }
    
    /**
     * @dev Verifica se um SALT já foi usado
     * @param salt SALT para verificar
     * @return used True se o SALT já foi usado
     */
    function isSaltUsed(bytes32 salt) external view returns (bool used) {
        return saltToAddress[salt] != address(0);
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
    
    // ===== INTERNAL CLONE FUNCTIONS =====
    
    /**
     * @dev Cria um clone usando CREATE2 (baseado no OpenZeppelin Clones.sol)
     */
    function cloneCreate2(address implementation_, bytes32 salt) internal returns (address instance) {
        /// @solidity memory-safe-assembly
        assembly {
            // Clones the contract with a specified salt.
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, implementation_))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create2(0, ptr, 0x37, salt)
        }
        require(instance != address(0), "ERC1167: create2 failed");
    }
    
    /**
     * @dev Cria um clone usando CREATE normal (baseado no OpenZeppelin Clones.sol)
     */
    function clone(address implementation_) internal returns (address instance) {
        /// @solidity memory-safe-assembly
        assembly {
            // Clones the contract with a specified salt.
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, implementation_))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }
        require(instance != address(0), "ERC1167: create failed");
    }
    
    /**
     * @dev Prediz o endereço que seria criado com CREATE2
     */
    function predictCreate2Address(address implementation_, bytes32 salt) internal view returns (address predicted) {
        /// @solidity memory-safe-assembly
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, implementation_))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf3000000000000000000000000000000000000)
            let hash := keccak256(ptr, 0x37)
            ptr := mload(0x40)
            mstore(ptr, shl(0x60, address()))
            mstore(add(ptr, 0x14), salt)
            mstore(add(ptr, 0x34), hash)
            predicted := keccak256(add(ptr, 0x0c), 0x40)
            predicted := shr(0x60, shl(0x60, predicted))
        }
    }
    
    // ===== FALLBACK =====
    
    /**
     * @dev Permite receber ETH
     */
    receive() external payable {}
}

