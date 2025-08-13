// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SatoshiKNYTReservationClean is ERC721Enumerable, Ownable {
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
    
    // Referral functions
    // Function to get referral statistics for a user
    function getReferralStats(address user) public view returns (
        uint256 totalReferrals,
        address[] memory referredAddresses,
        uint256 availableReferralShards
    ) {
        totalReferrals = referralCount[user];
        referredAddresses = referredUsers[user];
        availableReferralShards = REFERRAL_SHARD_SUPPLY - referralShardsMinted;
        return (totalReferrals, referredAddresses, availableReferralShards);
    }

    // Function to check if referral rewards are still available
    function canReceiveReferralReward() public view returns (bool) {
        return referralShardsMinted < REFERRAL_SHARD_SUPPLY;
    }

    // Function to get list of users referred by an address
    function getReferredUsers(address referrer) public view returns (address[] memory) {
        return referredUsers[referrer];
    }

    // Mint functions
    function mintFullWithReferrer(uint256 quantity, address referrer) public payable {
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
    
    function mintFull(uint256 quantity) public payable {
        mintFullWithReferrer(quantity, address(0));
    }
    
    function mintShard(uint256 quantity) public payable {
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
    
    function mintReferralShard(address to) public onlyOwner {
        require(referralShardsMinted < REFERRAL_SHARD_SUPPLY, "Exceeds referral shard supply");
        
        uint256 tokenId = totalSupply() + 1;
        referralShardsMinted += 1;
        _passTypes[tokenId] = PassType.Shard;
        _isReferralShard[tokenId] = true;
        _safeMint(to, tokenId);
        
        emit ReferralShardMinted(to, tokenId);
    }
    
    function mintCommunityShard(address to) public onlyOwner {
        require(communityShardsMinted < COMMUNITY_SHARD_SUPPLY, "Exceeds community shard supply");
        
        uint256 tokenId = totalSupply() + 1;
        communityShardsMinted += 1;
        _passTypes[tokenId] = PassType.Shard;
        _isCommunityShard[tokenId] = true;
        _safeMint(to, tokenId);
    }
    
    function toggleSaleState() public onlyOwner {
        saleIsActive = !saleIsActive;
    }
    
    function openReferralShardsForSale() public onlyOwner {
        referralShardsCanBeSold = true;
    }
    
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function passType(uint256 tokenId) public view returns (PassType) {
        require(_exists(tokenId), "Token does not exist");
        return _passTypes[tokenId];
    }
    
    function isReferralShard(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _isReferralShard[tokenId];
    }
    
    function isCommunityShard(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _isCommunityShard[tokenId];
    }
    
    function getSupplyInfo() public view returns (
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
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    function setBaseURI(string calldata baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function setPrices(uint256 _fullPrice, uint256 _shardPrice) public onlyOwner {
        fullPrice = _fullPrice;
        shardPrice = _shardPrice;
    }
}
