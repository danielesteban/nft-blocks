// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

// NFT Blocks token

contract BlocksToken is ERC721, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  uint128 private _mintingPrice = 0.005 ether;
  mapping (uint256 => bytes32) private _hashes;

  constructor(string memory baseURI) public ERC721("Blocks", "BLOCKS") {
    _setBaseURI(baseURI);
  }

  // Get token hash
  function hash(uint256 tokenId)
    public
    view
    returns (bytes32)
  {
    require(
      _exists(tokenId),
      "BlocksToken: hash query for nonexistent token"
    );
    return _hashes[tokenId];
  }

  // Create a new token
  function mint(bytes32 tokenHash)
    public
    payable
    returns (uint256)
  {
    require(
      msg.value >= _mintingPrice || _msgSender() == owner(),
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

  // Set the minting price
  function setMintingPrice(uint128 price)
    public
    onlyOwner
  {
    _mintingPrice = price;
  }
}
