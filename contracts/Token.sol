// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// revisar ghost inu para fee que convierte a eth y va para un wallet

contract MyERC20 is ERC20, Ownable {
    address public minter = 0x0000000000000000000000000000000000000000;

    constructor() ERC20("My Token", "TKN") {
    }

    // Admin

    function setMinter(address minter_address) public onlyOwner
    {
        minter = minter_address;
    }

    // Minter contract

    function mintReward(address beneficiary, uint amount) public
    {
        require(msg.sender == minter, "Must be minter");
        _mint(beneficiary, amount);
    }
}
