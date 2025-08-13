// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestMinimal {
    mapping(address => uint256) public referralCount;
    mapping(address => address[]) public referredUsers;
    uint256 public referralShardsMinted;
    uint256 public constant REFERRAL_SHARD_SUPPLY = 18;

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
