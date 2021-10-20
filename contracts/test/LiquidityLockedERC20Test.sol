// SPDX-License-Identifier: U-U-U-UPPPPP!!!
pragma solidity ^0.7.6;

import "../LiquidityLockedERC20.sol";

contract LiquidityLockedERC20Test is LiquidityLockedERC20("test", "TEST")
{   
    constructor()
    {
        _mint(msg.sender, 100 ether);
    } 
}