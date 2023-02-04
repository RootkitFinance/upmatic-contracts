// SPDX-License-Identifier: U-U-U-UPPPPP!!!
pragma solidity ^0.7.6;

import "./Address.sol";
import "./IUniswapV2Pair.sol";
import "./LiquidityLockedERC20.sol";
import "./SafeERC20.sol";
import "./SafeMath.sol";
import "./TokensRecoverable.sol";
import "./ITransferGate.sol";

contract RootedTransferGateV2 is TokensRecoverable, ITransferGate
{   
    using Address for address;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    LiquidityLockedERC20 immutable internal rootedToken;
    IUniswapV2Pair immutable internal basePair;
    IUniswapV2Pair immutable internal elitePair;
    IUniswapV2Pair immutable internal usdPair;

    bool public unrestricted;

    mapping (address => bool) public controllers;
    mapping (address => bool) public freeParticipants;

    address public override feeSplitter;
    uint16 public feesRate;

    constructor(LiquidityLockedERC20 _rootedToken, address _feeSplitter, IUniswapV2Pair _basePair, IUniswapV2Pair _elitePair, IUniswapV2Pair _usdPair)
    {
        rootedToken = _rootedToken;
        feeSplitter = _feeSplitter;
        basePair = _basePair;
        elitePair = _elitePair;
        usdPair = _usdPair;
    }

    function setFeeSplitter(address _feeSplitter) public ownerOnly() {
        feeSplitter = _feeSplitter;
    }
    
    function setControllers(address controller, bool allow) public ownerOnly() {
        controllers[controller] = allow;
    }

    function setFreeParticipant(address participant, bool free) public {
        require (msg.sender == owner || controllers[msg.sender], "Not an owner or free participant controller");
        freeParticipants[participant] = free;
    }

    // sets global fee rate
    function setFees(uint16 _feesRate) public {
        require (controllers[msg.sender] || msg.sender == owner, "Not an owner or controller");
        require (_feesRate <= 10000, "Fee rate must be less than or equal to 100%");
        feesRate = _feesRate;
    }

    // removes fees from all transfers
    function setUnrestricted(bool _unrestricted) public {
        require (controllers[msg.sender] || msg.sender == owner, "Not a controller");
        rootedToken.setLiquidityLock(basePair, !_unrestricted);
        rootedToken.setLiquidityLock(elitePair, !_unrestricted);
        rootedToken.setLiquidityLock(usdPair, !_unrestricted);
        unrestricted = _unrestricted;
    }

    function handleTransfer(address, address from, address to, uint256 amount) public virtual override returns (uint256) {
        if (unrestricted || freeParticipants[from] || freeParticipants[to]) {
            return 0;
        }
        return amount * feesRate / 10000;
    }
}