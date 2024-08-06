//SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DollNFT is ERC721AQueryable, Ownable {
    using Strings for uint256;

    string public baseURI;
    string public constant BASE_EXTENSION = ".json";
    uint256 public cost;
    uint256 public immutable maxSupply;
    uint256 public maxMintAmountPerTx;

    uint256 public paused = 1;

    error dollContractIsPaused();
    error dollNFTSupplyLimitExceeded();
    error dollInvalidMintAmount();
    error dollMaxMintAmountExceeded();
    error dollInsufficientFunds();
    error dollQueryForNonExistentToken();

    constructor(
        uint256 _maxSupply,
        uint256 _cost,
        uint256 _maxMintAmountPerTx
    ) ERC721A("Doll NFT", "DNFT") {
        cost = _cost;
        maxMintAmountPerTx = _maxMintAmountPerTx;
        maxSupply = _maxSupply;
    }

    /**
        MINT function
    **/
    function mint(uint256 _mintAmount) external payable {
        if (paused == 1) revert dollContractIsPaused();
        if (_mintAmount == 0) revert dollInvalidMintAmount();
        if (_mintAmount > maxMintAmountPerTx)
            revert dollMaxMintAmountExceeded();
        uint256 supply = totalSupply();
        if (supply + _mintAmount > maxSupply)
            revert dollNFTSupplyLimitExceeded();
        if (msg.sender != owner()) {
            if (msg.value < cost * _mintAmount) revert dollInsufficientFunds();
        }
        _safeMint(msg.sender, _mintAmount);
    }

    /**
        owner functions    
     */

    function setCost(uint256 _newCost) external payable onlyOwner {
        cost = _newCost;
    }

    function setMaxMintAmountPerTx(
        uint256 _newMaxMintAmount
    ) external payable onlyOwner {
        maxMintAmountPerTx = _newMaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) external payable onlyOwner {
        baseURI = _newBaseURI;
    }

    function pause(uint256 _state) external payable onlyOwner {
        paused = _state;
    }

    function withdraw() external payable onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        require(success);
    }

    //--------------------------------------------------------------------
    // VIEW FUNCTIONS

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert dollQueryForNonExistentToken();

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        BASE_EXTENSION
                    )
                )
                : "";
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
