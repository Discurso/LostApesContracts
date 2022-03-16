// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// revisar ghost inu para fee que convierte a eth y va para un wallet

contract MyERC20 is ERC20, Ownable {
    mapping(address => bool) public is_minter;

    constructor() ERC20("My Token", "TKN") {
    }

    // Admin

    function setMinter(address minter_address, bool is_active) public onlyOwner
    {
        is_minter[minter_address] = is_active;
    }

    // Minter contract

    function mintReward(address beneficiary, uint amount) public
    {
        require(is_minter[msg.sender], "Must be minter");
        _mint(beneficiary, amount);
    }
}
