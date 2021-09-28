// SPDX-License-Identifier: U-U-U-UPPPPP!!!
pragma solidity ^0.7.6;

interface ITransferGate
{
    function feeSplitter() external view returns (address);
    function handleTransfer(address msgSender, address from, address to, uint256 amount) external returns (uint256);
}