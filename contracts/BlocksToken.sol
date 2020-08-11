// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

// NFT Blocks token

contract BlocksToken is ERC721, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  uint128 private _mintingCost;
  mapping (uint256 => string) private _hashes;

  constructor(string memory baseURI, uint128 mintingCost) public ERC721("Blocks", "BLOCKS") {
    _setBaseURI(baseURI);
    _mintingCost = mintingCost;
  }

  // Get token hash
  function hash(uint256 tokenId)
    public
    view
    returns (string memory)
  {
    require(
      _exists(tokenId),
      "BlocksToken: hash query for nonexistent token"
    );
    return _hashes[tokenId];
  }

  // Create a new token
  function mint(string memory tokenHash)
    public
    payable
    returns (uint256)
  {
    require(
      msg.value >= _mintingCost || _msgSender() == owner(),
      "BlocksToken: minting query without enough value"
    );
    uint256 tokenId = _tokenIds.current();
    _hashes[tokenId] = tokenHash;
    _safeMint(_msgSender(), tokenId);
    _tokenIds.increment();
    if (msg.value > 0) {
      payable(owner()).transfer(msg.value);
    }
    return tokenId;
  }

  // Update the minting cost
  function updateMintingCost(uint128 cost)
    public
    onlyOwner
  {
    _mintingCost = cost;
  }
}
