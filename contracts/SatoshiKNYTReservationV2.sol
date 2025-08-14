// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SatoshiKNYTReservationV2 is ERC721Enumerable, Ownable {
    enum PassType { Full, Shard }
    
    // Constants
    uint256 public constant MAX_FULL_SUPPLY = 21;
    uint256 public constant MAX_SHARD_SUPPLY = 2100;
    uint256 public constant REFERRAL_SHARD_SUPPLY = 18;
    uint256 public constant COMMUNITY_SHARD_SUPPLY = 21;
    uint256 public constant TOTAL_SHARD_SUPPLY = MAX_SHARD_SUPPLY + REFERRAL_SHARD_SUPPLY + COMMUNITY_SHARD_SUPPLY;
    
    // State variables
    uint256 public fullPrice = 0.21 ether;
    uint256 public shardPrice = 0.021 ether;
    bool public saleIsActive = false;
    bool public referralShardsCanBeSold = false;
    
    // Counters
    uint256 public fullMinted = 0;
    uint256 public shardMinted = 0;
    uint256 public referralShardsMinted = 0;
    uint256 public communityShardsMinted = 0;
    
    // Mappings
    mapping(uint256 => PassType) private _passTypes;
    mapping(uint256 => bool) private _isReferralShard;
    mapping(uint256 => bool) private _isCommunityShard;
    mapping(address => uint256) public referralCount;
    mapping(address => address[]) public referredUsers;
    
    string private _baseTokenURI;
    
    // Events
    event ReferralShardMinted(address indexed referrer, uint256 indexed tokenId);
    event ReferralReward(address indexed referrer, address indexed referee, uint256 indexed tokenId);
    
    constructor(string memory baseURI) ERC721("21 Sats Reservation Portal", "21SATS") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    function mintFullWithReferrer(uint256 quantity, address referrer) external payable {
        _mintFullWithReferrer(quantity, referrer);
    }
    
    function mintFull(uint256 quantity) external payable {
        _mintFullWithReferrer(quantity, address(0));
    }

    function _mintFullWithReferrer(uint256 quantity, address referrer) internal {
        require(saleIsActive, "Sale is not active");
        require(quantity > 0, "Quantity must be positive");
        require(fullMinted + quantity <= MAX_FULL_SUPPLY, "Exceeds full supply");
        require(msg.value == fullPrice * quantity, "Incorrect ETH sent");
        
        // Process referral reward if valid referrer provided
        if (referrer != address(0) && referrer != msg.sender && referralShardsMinted < REFERRAL_SHARD_SUPPLY) {
            // Mint referral shard to referrer
            uint256 referralTokenId = totalSupply() + 1;
            referralShardsMinted += 1;
            _passTypes[referralTokenId] = PassType.Shard;
            _isReferralShard[referralTokenId] = true;
            _safeMint(referrer, referralTokenId);
            
            // Update referral tracking
            referralCount[referrer] += 1;
            referredUsers[referrer].push(msg.sender);
            
            emit ReferralShardMinted(referrer, referralTokenId);
            emit ReferralReward(referrer, msg.sender, referralTokenId);
        }
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = totalSupply() + 1;
            fullMinted += 1;
            _passTypes[tokenId] = PassType.Full;
            _safeMint(msg.sender, tokenId);
        }
    }
    
    function mintShard(uint256 quantity) external payable {
        require(saleIsActive, "Sale is not active");
        require(quantity > 0, "Quantity must be positive");
        require(shardMinted + quantity <= MAX_SHARD_SUPPLY, "Exceeds shard supply");
        require(msg.value == shardPrice * quantity, "Incorrect ETH sent");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = totalSupply() + 1;
            shardMinted += 1;
            _passTypes[tokenId] = PassType.Shard;
            _safeMint(msg.sender, tokenId);
        }
    }
    
    function toggleSaleState() external onlyOwner {
        saleIsActive = !saleIsActive;
    }
    
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function passType(uint256 tokenId) external view returns (PassType) {
        require(_exists(tokenId), "Token does not exist");
        return _passTypes[tokenId];
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function setPrices(uint256 _fullPrice, uint256 _shardPrice) external onlyOwner {
        fullPrice = _fullPrice;
        shardPrice = _shardPrice;
    }
    
    // REFERRAL FUNCTIONS - These should be included in compilation
    function getReferralStats(address user) external view returns (
        uint256 totalReferrals,
        address[] memory referredAddresses,
        uint256 availableReferralShards
    ) {
        return (
            referralCount[user],
            referredUsers[user],
            REFERRAL_SHARD_SUPPLY - referralShardsMinted
        );
    }

    function canReceiveReferralReward() external view returns (bool) {
        return referralShardsMinted < REFERRAL_SHARD_SUPPLY;
    }

    function getReferredUsers(address referrer) external view returns (address[] memory) {
        return referredUsers[referrer];
    }
}
