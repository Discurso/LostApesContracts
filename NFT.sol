// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Minter {
    function register(uint token_id) public
    {
    }
}

contract IndexNFT is ERC721, Ownable {

    Minter minter;
    uint counter;

    constructor() ERC721("My NFT", "MNFT")
    {
    }

    function setMinter(address minter_contract_address) public onlyOwner
    {
        minter = Minter(minter_contract_address);
    }

    function mint() public
    {
        _mint(msg.sender, counter);
        minter.register(counter);
        counter += 1;
    }
}
