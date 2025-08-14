// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SatoshiKNYTReservationFixed is ERC721Enumerable, Ownable {
    enum PassType { Full, Shard }

    uint256 public fullPrice;
    uint256 public shardPrice;

    // Supply constants
    uint256 public constant MAX_FULL_SUPPLY = 18;
    uint256 public constant MAX_SHARD_SUPPLY = 21;
    uint256 public constant REFERRAL_SHARD_SUPPLY = 18;
    uint256 public constant COMMUNITY_SHARD_SUPPLY = 3;
    uint256 public constant TOTAL_SHARD_SUPPLY = 42;

    uint256 public fullMinted;
    uint256 public shardMinted;
    uint256 public referralShardsMinted;
    uint256 public communityShardsMinted;

    bool public saleIsActive;
    bool public referralShardsCanBeSold;

    mapping(uint256 => PassType) private _passTypes;
    mapping(uint256 => bool) private _isReferralShard;
    mapping(uint256 => bool) private _isCommunityShard;
    mapping(address => uint256) public referralCount;
    mapping(address => address[]) public referredUsers;
    string private _baseTokenURI;

    event ReferralShardMinted(address indexed to, uint256 tokenId);
    event CommunityShardMinted(address indexed to, uint256 tokenId);
    event ReferralShardsOpenedForSale();
    event ReferralReward(address indexed referrer, address indexed referee, uint256 referralShardTokenId);

    constructor(
        uint256 _fullPrice,
        uint256 _shardPrice,
        string memory _baseURI
    ) ERC721("21 Sats Reservation Pass", "21SRP") {
        fullPrice = _fullPrice;
        shardPrice = _shardPrice;
        _baseTokenURI = _baseURI;
    }

    function mintFull(uint256 quantity, address referrer) external payable {
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
    
    function mintFull(uint256 quantity) external payable {
        mintFull(quantity, address(0));
    }

    function mintShard(uint256 quantity) external payable {
        require(saleIsActive, "Sale is not active");
        require(quantity > 0, "Quantity must be positive");
        
        uint256 availableShards = MAX_SHARD_SUPPLY + 
            (referralShardsCanBeSold ? (REFERRAL_SHARD_SUPPLY - referralShardsMinted) : 0);
        require(shardMinted + quantity <= availableShards, "Exceeds shard supply");
        require(msg.value == shardPrice * quantity, "Incorrect ETH sent");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = totalSupply() + 1;
            shardMinted += 1;
            _passTypes[tokenId] = PassType.Shard;
            _safeMint(msg.sender, tokenId);
        }
    }

    function mintReferralShard(address to) external onlyOwner {
        require(referralShardsMinted < REFERRAL_SHARD_SUPPLY, "All referral shards minted");
        
        uint256 tokenId = totalSupply() + 1;
        referralShardsMinted += 1;
        _passTypes[tokenId] = PassType.Shard;
        _isReferralShard[tokenId] = true;
        _safeMint(to, tokenId);
        
        emit ReferralShardMinted(to, tokenId);
    }

    function mintCommunityShard(address to) external onlyOwner {
        require(communityShardsMinted < COMMUNITY_SHARD_SUPPLY, "All community shards minted");
        
        uint256 tokenId = totalSupply() + 1;
        communityShardsMinted += 1;
        _passTypes[tokenId] = PassType.Shard;
        _isCommunityShard[tokenId] = true;
        _safeMint(to, tokenId);
        
        emit CommunityShardMinted(to, tokenId);
    }

    function toggleSaleState() external onlyOwner {
        saleIsActive = !saleIsActive;
    }

    function setPrices(uint256 _fullPrice, uint256 _shardPrice) external onlyOwner {
        fullPrice = _fullPrice;
        shardPrice = _shardPrice;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function openReferralShardsForSale() external onlyOwner {
        referralShardsCanBeSold = true;
        emit ReferralShardsOpenedForSale();
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function passType(uint256 tokenId) external view returns (PassType) {
        require(_exists(tokenId), "Token does not exist");
        return _passTypes[tokenId];
    }

    function isReferralShard(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _isReferralShard[tokenId];
    }

    function isCommunityShard(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _isCommunityShard[tokenId];
    }

    function getSupplyInfo() external view returns (
        uint256 maxFullSupply,
        uint256 maxShardSupply,
        uint256 referralShardSupply,
        uint256 communityShardSupply,
        uint256 currentFullMinted,
        uint256 currentShardMinted,
        uint256 currentReferralShardsMinted,
        uint256 currentCommunityShardsMinted
    ) {
        return (
            MAX_FULL_SUPPLY,
            MAX_SHARD_SUPPLY,
            REFERRAL_SHARD_SUPPLY,
            COMMUNITY_SHARD_SUPPLY,
            fullMinted,
            shardMinted,
            referralShardsMinted,
            communityShardsMinted
        );
    }

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
