// SPDX-License-Identifier: U-U-U-UPPPPP!!!
pragma solidity ^0.7.6;

import "./TokensRecoverable.sol";
import "./RootedTransferGate.sol";

// Contract to add 1 sided liquidty after buys via 
// selling and setting the "to" address as the pool

contract SingleSideLiquidityAdder is TokensRecoverable {    
    
    IUniswapV2Router02 immutable private uniswapRouter;
    RootedTransferGate private gate;
    IERC20 immutable private rooted;
    mapping (address => bool) controllers;
    
    constructor (IERC20 _rooted, RootedTransferGate _gate, IUniswapV2Router02 _uniswapRouter) {
        rooted = _rooted;
        gate = _gate;
        uniswapRouter = _uniswapRouter;
        _rooted.approve(address(_uniswapRouter), uint(-1));
    }

    function setController(address _controller, bool _canControl) public ownerOnly() {
        controllers[_controller] = _canControl;
    }

    function updateGate(RootedTransferGate _gate) public ownerOnly() {
        gate = _gate;
    }

    function addSingleSideLiquidity(uint256 amount, uint256 minAmountOut, address pairedToken, address pair) public {
        require(controllers[msg.sender], "Not a Controller");
        require(rooted.balanceOf(address(this)) >= amount, "Not enough upToken Balance");

        gate.setUnrestricted(true);

        address[] memory path = new address[](2);
        path[0] = address(rooted);
        path[1] = pairedToken;
        uniswapRouter.swapExactTokensForTokens(amount, minAmountOut, path, pair, block.timestamp);

        gate.setUnrestricted(false);
    }
}