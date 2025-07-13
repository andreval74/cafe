// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TokenImplementation
 * @dev Contrato base ERC-20 para ser usado com EIP-1167 (Minimal Proxy)
 * Este contrato será deployado uma vez por rede e clonado para cada novo token
 */
contract TokenImplementation {
    // ===== STORAGE VARIABLES =====
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    address public owner;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Controle de inicialização (importante para clones)
    bool private initialized;
    
    // ===== EVENTS =====
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // ===== MODIFIERS =====
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyInitialized() {
        require(initialized, "Not initialized");
        _;
    }
    
    // ===== INITIALIZATION =====
    
    /**
     * @dev Inicializa o clone com os parâmetros específicos do token
     * Esta função substitui o constructor para clones EIP-1167
     * @param _name Nome do token
     * @param _symbol Símbolo do token
     * @param _decimals Número de decimais
     * @param _totalSupply Supply total (em unidades inteiras, será multiplicado por 10^decimals)
     * @param _owner Endereço do proprietário inicial
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        address _owner
    ) external {
        require(!initialized, "Already initialized");
        require(_owner != address(0), "Owner cannot be zero address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        require(_totalSupply > 0, "Total supply must be greater than 0");
        
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * 10**_decimals;
        owner = _owner;
        
        // Transferir todo o supply inicial para o owner
        balanceOf[_owner] = totalSupply;
        initialized = true;
        
        emit Transfer(address(0), _owner, totalSupply);
        emit OwnershipTransferred(address(0), _owner);
    }
    
    // ===== ERC-20 FUNCTIONS =====
    
    /**
     * @dev Transfere tokens para outro endereço
     */
    function transfer(address to, uint256 value) external onlyInitialized returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    /**
     * @dev Aprova outro endereço a gastar tokens em seu nome
     */
    function approve(address spender, uint256 value) external onlyInitialized returns (bool) {
        require(spender != address(0), "Approve to zero address");
        
        allowance[msg.sender][spender] = value;
        
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    /**
     * @dev Transfere tokens de um endereço para outro (requer aprovação)
     */
    function transferFrom(address from, address to, uint256 value) external onlyInitialized returns (bool) {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    // ===== OWNER FUNCTIONS =====
    
    /**
     * @dev Transfere a propriedade do contrato
     */
    function transferOwnership(address newOwner) external onlyOwner onlyInitialized {
        require(newOwner != address(0), "New owner cannot be zero address");
        
        address previousOwner = owner;
        owner = newOwner;
        
        emit OwnershipTransferred(previousOwner, newOwner);
    }
    
    /**
     * @dev Permite ao owner criar novos tokens (mint)
     * Função opcional para expansão do supply
     */
    function mint(address to, uint256 amount) external onlyOwner onlyInitialized {
        require(to != address(0), "Mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        totalSupply += amount;
        balanceOf[to] += amount;
        
        emit Transfer(address(0), to, amount);
    }
    
    /**
     * @dev Permite ao owner queimar tokens
     */
    function burn(uint256 amount) external onlyOwner onlyInitialized {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance to burn");
        
        totalSupply -= amount;
        balanceOf[msg.sender] -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
    }
    
    // ===== VIEW FUNCTIONS =====
    
    /**
     * @dev Retorna se o contrato foi inicializado
     */
    function isInitialized() external view returns (bool) {
        return initialized;
    }
    
    /**
     * @dev Retorna informações básicas do token
     */
    function getTokenInfo() external view returns (
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        address _owner,
        bool _initialized
    ) {
        return (name, symbol, decimals, totalSupply, owner, initialized);
    }
    
    // ===== UTILITY FUNCTIONS =====
    
    /**
     * @dev Aumenta a aprovação de um spender
     */
    function increaseAllowance(address spender, uint256 addedValue) external onlyInitialized returns (bool) {
        require(spender != address(0), "Increase allowance to zero address");
        
        allowance[msg.sender][spender] += addedValue;
        
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }
    
    /**
     * @dev Diminui a aprovação de um spender
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) external onlyInitialized returns (bool) {
        require(spender != address(0), "Decrease allowance to zero address");
        require(allowance[msg.sender][spender] >= subtractedValue, "Decreased allowance below zero");
        
        allowance[msg.sender][spender] -= subtractedValue;
        
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }
}

