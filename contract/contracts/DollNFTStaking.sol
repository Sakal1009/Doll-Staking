// //SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./interfaces/IDollFT.sol";
import "./interfaces/IDollNFT.sol";

contract DollNFTStaking is IERC721Receiver {
    uint256 public totalItemsStaked;
    uint256 private constant MONTH = 30 days;

    IDollNFT immutable nft;
    IDollFT immutable token;

    struct Stake {
        address owner;
        uint64 stakedAt;
    }

    mapping(uint256 => Stake) vault;

    event ItemsStaked(uint256[] tokenIds, address owner);
    event ItemsUnstaked(uint256[] tokenIds, address owner);
    event Claimed(address owner, uint256 reward);

    error dollNFTStakingVaultItemAlreadyStaked();
    error dollNFTStakingVaultNotItemOwner();

    constructor(address _nftAddress, address _tokenAddress) {
        nft = IDollNFT(_nftAddress);
        token = IDollFT(_tokenAddress);
    }

    function stake(uint256[] calldata tokenIds) external {
        uint256 stakeCount = tokenIds.length;

        for (uint256 i; i < stakeCount; i++) {
            uint256 tokenId = tokenIds[i];
            if (vault[tokenId].owner != address(0)) {
                revert dollNFTStakingVaultItemAlreadyStaked();
            }
            if (nft.ownerOf(tokenId) != msg.sender) {
                revert dollNFTStakingVaultNotItemOwner();
            }

            nft.safeTransferFrom(msg.sender, address(this), tokenId);
            vault[tokenId] = Stake(msg.sender, uint64(block.timestamp));
        }
        totalItemsStaked = totalItemsStaked + stakeCount;

        emit ItemsStaked(tokenIds, msg.sender);
    }

    function claim(uint256[] calldata tokenIds) external {
        _claim(msg.sender, tokenIds, false);
    }

    function unstake(uint256[] calldata tokenIds) external {
        _claim(msg.sender, tokenIds, true);
    }

    /** @notice  internal function to claim user rewards accured
        @dev     calculate rewards based on staking period of each token
        @param   user        - address of user to claim for, must be owner of tokenIds
        @param   tokenIds    - array of token ids to claim reward for
        @param   unstakeFlag - bool treu if user wants to unstake, false if user wants only claim rewards
    */
    function _claim(
        address user,
        uint256[] calldata tokenIds,
        bool unstakeFlag
    ) internal {
        uint256 tokenId;
        uint256 totalReward;
        uint256 len = tokenIds.length;

        for (uint256 i; i < len; i++) {
            tokenId = tokenIds[i];
            if (vault[tokenId].owner != user)
                revert dollNFTStakingVaultNotItemOwner();
            uint256 _stakedAt = uint256(vault[tokenId].stakedAt);
            uint256 stakingPeriod = block.timestamp - _stakedAt;
            uint256 _dailyReward = _calculateReward(stakingPeriod);
            totalReward += (_dailyReward * stakingPeriod * 1e18) / 1 days;
            vault[tokenId].stakedAt = uint64(block.timestamp);
        }

        if (totalReward != 0) {
            token.mint(user, totalReward);
            emit Claimed(user, totalReward);
        }

        if (unstakeFlag) {
            _unstake(user, tokenIds);
        }
    }

    /**
        @notice internal function to unstake user staked NFTs
        @dev should be called after claiming
        @param user - address of user to unstake for
        @param tokenIds - array of NFT ids to unstake
     */
    function _unstake(address user, uint256[] calldata tokenIds) internal {
        uint256 count = tokenIds.length;
        for (uint256 i; i < count; i++) {
            uint256 tokenId = tokenIds[i];
            require(vault[tokenId].owner == user, "Not Owner");

            delete vault[tokenId];
            nft.safeTransferFrom(address(this), user, tokenId);
        }

        totalItemsStaked = totalItemsStaked - count;
        emit ItemsUnstaked(tokenIds, user);
    }

    /** 
        @notice returns daily reward by given staking period
    */
    function _calculateReward(
        uint256 stakingPeriod
    ) internal pure returns (uint256 dailyReward) {
        if (stakingPeriod <= MONTH) dailyReward = 1;
        else if (stakingPeriod <= MONTH * 3) dailyReward = 2;
        else if (stakingPeriod <= MONTH * 6) dailyReward = 3;
        else if (stakingPeriod <= MONTH * 12) dailyReward = 4;
        else if (stakingPeriod > MONTH * 12) dailyReward = 8;
    }

    function getDailyReward(
        uint256 stakingPeriod
    ) external pure returns (uint256 dailyReward) {
        dailyReward = _calculateReward(stakingPeriod);
    }

    function getTotalRewardEarned(
        address user
    ) external view returns (uint256 totalReward) {
        uint256[] memory tokens = tokensOfOwner(user);
        uint256 len = tokens.length;
        for (uint256 i; i < len; i++) {
            uint256 _stakedAt = uint256(vault[tokens[i]].stakedAt);
            uint256 stakingPeriod = block.timestamp - _stakedAt;
            uint256 _dailyReward = _calculateReward(stakingPeriod);
            totalReward += (_dailyReward * stakingPeriod * 1e18) / 1 days;
        }
    }

    function getRewardEarnedPerNft(
        uint256 _tokenId
    ) external view returns (uint256 reward) {
        uint256 _stakedAt = uint256(vault[_tokenId].stakedAt);
        uint256 stakingPeriod = block.timestamp - _stakedAt;
        uint256 _dailyReward = _calculateReward(stakingPeriod);
        reward = (_dailyReward * stakingPeriod * 1e18) / 1 days;
    }

    function balanceOf(
        address user
    ) public view returns (uint256 nftStakedbalance) {
        uint256 supply = nft.totalSupply();
        unchecked {
            for (uint256 i; i <= supply; i++) {
                if (vault[i].owner == user) {
                    nftStakedbalance += 1;
                }
            }
        }
    }

    function tokensOfOwner(
        address user
    ) public view returns (uint256[] memory tokens) {
        uint256 balance = balanceOf(user);
        if (balance == 0) return tokens;
        uint256 supply = nft.totalSupply();
        tokens = new uint256[](balance);

        uint256 counter;
        unchecked {
            for (uint256 i; i <= supply; ++i) {
                if (vault[i].owner == user) {
                    tokens[counter] = i;
                    counter++;
                    if (counter == balance) return tokens;
                }
            }
        }
    }

    /// @notice allow vault contract (address(this)) to receive ERC721 tokens
    function onERC721Received(
        address /**operator*/,
        address /**from*/,
        uint256 /**amount*/,
        bytes calldata //data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
