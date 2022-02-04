// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyToken {
    function mintReward(address beneficiary, uint amount) public
    {
    }
}

contract Minter {
    address public TOKEN_CONTRACT_ADDRESS = 0x26fc65F5062aBc98eb1D13E56E122865d977bA78;
    address public NFT_CONTRACT_ADDRESS = 0xB11Ba4003f37D68169C3c8ea1296EcBe093A2BAC;

    uint public REWARD_PER_BLOCK = 0.1 ether;

    MyToken public token_contract = MyToken(TOKEN_CONTRACT_ADDRESS);
    ERC721 public nft_contract = ERC721(NFT_CONTRACT_ADDRESS);

    mapping(uint => uint256) public checkpoints;
    mapping(uint => bool) public is_registered;

    function setCheckpoint(uint token_id) internal
    {
        checkpoints[token_id] = block.number;
    }

    function register(uint token_id) public
    {
        require(msg.sender == NFT_CONTRACT_ADDRESS);
        is_registered[token_id] = true;
        setCheckpoint(token_id);
    }

    function collect(uint token_id) public
    {
        require(nft_contract.ownerOf(token_id) == msg.sender, "Must be token owner");
        uint256 reward = calculateReward(token_id);
        token_contract.mintReward(msg.sender, reward);
        setCheckpoint(token_id);
    }

    function calculateReward(uint token_id) public view returns(uint256)
    {
        if(!is_registered[token_id])
        {
            return 0;
        }
        uint256 checkpoint = checkpoints[token_id];
        return REWARD_PER_BLOCK * (block.number-checkpoint);
    }
}
