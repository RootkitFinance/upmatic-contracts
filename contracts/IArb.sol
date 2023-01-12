// SPDX-License-Identifier: U-U-U-UPPPPP!!!
pragma solidity ^0.7.4;

import "./IERC20.sol";

interface IArb {
    function unrestrictedSwap(uint amount, uint minAmountOut, address[] calldata path) external;
    function balancePriceBase(uint256 amount, uint256 minAmountOut) external;
    function balancePriceElite(uint256 amount, uint256 minAmountOut) external;
    function withdrawTokensToMultisig(IERC20 token, uint256 amount) external;
}