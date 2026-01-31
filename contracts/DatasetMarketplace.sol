// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DatasetMarketplace is ReentrancyGuard, Ownable {
    
    // Constants
    uint256 public constant PLATFORM_FEE_PERCENT = 250; // 2.5% (basis points)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // State variables
    uint256 public datasetCount;
    uint256 public totalPlatformFees;
    
    struct Dataset {
        address seller;
        bytes32 rootHash;        // Changed to bytes32 (gas efficient)
        string metadataURI;
        uint256 price;
        uint256 timestamp;
        bool active;
    }
    
    // Mappings
    mapping(uint256 => Dataset) public datasets;
    mapping(uint256 => mapping(address => bool)) public access;
    mapping(address => uint256) public sellerBalances;
    
    // Events
    event DatasetListed(
        uint256 indexed id,
        address indexed seller,
        bytes32 rootHash,
        uint256 price,
        string metadataURI
    );
    
    event DatasetPurchased(
        uint256 indexed id,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 platformFee
    );
    
    event DatasetStatusChanged(uint256 indexed id, bool active);
    event FundsWithdrawn(address indexed seller, uint256 amount);
    event PlatformFeesWithdrawn(address indexed owner, uint256 amount);
    
    // Modifiers
    modifier datasetExists(uint256 id) {
        require(id > 0 && id <= datasetCount, "Dataset does not exist");
        _;
    }
    
    modifier onlySeller(uint256 id) {
        require(datasets[id].seller == msg.sender, "Not the seller");
        _;
    }
    
    // Constructor
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice List a new dataset for sale
     * @param rootHash Merkle root hash from 0G Storage (bytes32)
     * @param metadataURI URI pointing to dataset metadata
     * @param price Price in wei
     */
    function listDataset(
        bytes32 rootHash,
        string calldata metadataURI,
        uint256 price
    ) external returns (uint256) {
        require(rootHash != bytes32(0), "Invalid root hash");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        require(price > 0, "Price must be greater than 0");
        
        datasetCount++;
        uint256 newId = datasetCount;
        
        datasets[newId] = Dataset({
            seller: msg.sender,
            rootHash: rootHash,
            metadataURI: metadataURI,
            price: price,
            timestamp: block.timestamp,
            active: true
        });
        
        // Seller automatically has access
        access[newId][msg.sender] = true;
        
        emit DatasetListed(newId, msg.sender, rootHash, price, metadataURI);
        
        return newId;
    }
    
    /**
     * @notice Purchase access to a dataset
     * @param id Dataset ID
     */
    function purchaseDataset(uint256 id) 
        external 
        payable 
        nonReentrant 
        datasetExists(id) 
    {
        Dataset storage dataset = datasets[id];
        
        require(dataset.active, "Dataset not active");
        require(msg.value >= dataset.price, "Insufficient payment");
        require(!access[id][msg.sender], "Already purchased");
        require(msg.sender != dataset.seller, "Seller cannot purchase own dataset");
        
        // Grant access BEFORE external calls (CEI pattern)
        access[id][msg.sender] = true;
        
        // Calculate fees
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENT) / FEE_DENOMINATOR;
        uint256 sellerAmount = msg.value - platformFee;
        
        // Update balances (pull pattern)
        sellerBalances[dataset.seller] += sellerAmount;
        totalPlatformFees += platformFee;
        
        emit DatasetPurchased(id, msg.sender, dataset.seller, msg.value, platformFee);
        
        // Refund excess payment if any
        if (msg.value > dataset.price) {
            uint256 refund = msg.value - dataset.price;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
    }
    
    /**
     * @notice Check if user has access to dataset
     * @param id Dataset ID
     * @param user User address
     */
    function hasAccess(uint256 id, address user) 
        external 
        view 
        datasetExists(id)
        returns (bool) 
    {
        return access[id][user] || datasets[id].seller == user;
    }
    
    /**
     * @notice Toggle dataset active status
     * @param id Dataset ID
     */
    function toggleDatasetStatus(uint256 id) 
        external 
        datasetExists(id) 
        onlySeller(id) 
    {
        datasets[id].active = !datasets[id].active;
        emit DatasetStatusChanged(id, datasets[id].active);
    }
    
    /**
     * @notice Update dataset price
     * @param id Dataset ID
     * @param newPrice New price in wei
     */
    function updatePrice(uint256 id, uint256 newPrice) 
        external 
        datasetExists(id) 
        onlySeller(id) 
    {
        require(newPrice > 0, "Price must be greater than 0");
        datasets[id].price = newPrice;
    }
    
    /**
     * @notice Withdraw seller earnings
     */
    function withdrawFunds() external nonReentrant {
        uint256 balance = sellerBalances[msg.sender];
        require(balance > 0, "No funds to withdraw");
        
        sellerBalances[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(msg.sender, balance);
    }
    
    /**
     * @notice Withdraw platform fees (owner only)
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 amount = totalPlatformFees;
        require(amount > 0, "No fees to withdraw");
        
        totalPlatformFees = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit PlatformFeesWithdrawn(owner(), amount);
    }
    
    /**
     * @notice Get dataset details
     * @param id Dataset ID
     */
    function getDataset(uint256 id) 
        external 
        view 
        datasetExists(id)
        returns (
            address seller,
            bytes32 rootHash,
            string memory metadataURI,
            uint256 price,
            uint256 timestamp,
            bool active
        ) 
    {
        Dataset memory d = datasets[id];
        return (d.seller, d.rootHash, d.metadataURI, d.price, d.timestamp, d.active);
    }
    
    /**
     * @notice Get seller balance
     * @param seller Seller address
     */
    function getSellerBalance(address seller) external view returns (uint256) {
        return sellerBalances[seller];
    }
}