// SPDX-License-Identifier: U-U-U-UPPPPP!!!
pragma solidity ^0.7.6;

interface IVault
{
    function swap(uint amountIn, uint amountOutMin, address[] calldata path) external;
    function swapSupportingFee(uint amountIn, uint amountOutMin, address[] calldata path) external;
    function balancePriceBase(uint256 amount, uint256 minAmountOut) external;
    function balancePriceElite(uint256 amount, uint256 minAmountOut) external;
    function removeBuyAndTax(uint256 amount, uint256 minAmountOut, address token, uint16 tax, uint256 time) external;
    function buyAndTax(address token, uint256 amountToSpend, uint256 minAmountOut, uint16 tax, uint256 time) external;
    function sweepFloor() external;
    function wrapToElite(uint256 baseAmount) external;
    function unwrapElite(uint256 eliteAmount) external;
    function addLiquidity(address pairedToken, uint256 pairedAmount, uint256 rootedAmount, uint256 pairedAmountMin, uint256 rootedAmountMin) external;
    function removeLiquidity(address pairedToken, uint256 lpTokens, uint256 pairedAmountMin, uint256 rootedAmountMin) external;
    function buyRooted(address token, uint256 amountToSpend, uint256 minAmountOut) external;
    function sellRooted(address token, uint256 amountToSpend, uint256 minAmountOut) external;
}