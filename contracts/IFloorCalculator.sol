// SPDX-License-Identifier: U-U-U-UPPPPP!!!
pragma solidity ^0.7.6;

import "./IERC20.sol";

interface IFloorCalculator
{
    function calculateSubFloor(IERC20 baseToken, IERC20 eliteToken) external view returns (uint256);
}