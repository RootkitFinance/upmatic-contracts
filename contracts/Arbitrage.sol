// SPDX-License-Identifier: U-U-U-UPPPPP!!!
pragma solidity ^0.7.6;

import "./IERC20.sol";
import "./IERC31337.sol";
import "./TokensRecoverable.sol";
import "./IUniswapV2Router02.sol";

contract Arbitrage is TokensRecoverable
{
    IERC20 immutable usdToken;
    IERC20 immutable baseToken;
    IERC31337 immutable eliteToken;
    IERC20 immutable rootedToken;
    IUniswapV2Router02 immutable uniswapRouter;

    mapping (address => bool) public arbitrageurs;
    
    uint public minRootedBalance;

    constructor(IERC20 _baseToken, IERC20 _usdToken, IERC31337 _eliteToken, IERC20 _rootedToken, IUniswapV2Router02 _uniswapRouter) {
        usdToken = _usdToken;
        baseToken = _baseToken;
        eliteToken = _eliteToken;
        rootedToken = _rootedToken;
        uniswapRouter = _uniswapRouter;

        _usdToken.approve(address(_uniswapRouter), uint256(-1));
        _baseToken.approve(address(_uniswapRouter), uint256(-1));
        _eliteToken.approve(address(_uniswapRouter), uint256(-1));
        _rootedToken.approve(address(_uniswapRouter), uint256(-1));
        _baseToken.approve(address(_eliteToken), uint256(-1));
    }

    modifier arbitrageurOnly() {
        require(arbitrageurs[msg.sender], "Not an arbitrageur");
        _;
    }

    function setArbitrageur(address arbitrageur, bool allow) public ownerOnly() {
        arbitrageurs[arbitrageur] = allow;
    }

    function setMinRootedBalance(uint256 _minRootedBalance) public ownerOnly() {
        minRootedBalance = _minRootedBalance;
    }

    function witdrawProfits() public ownerOnly() {
        uint balance = rootedToken.balanceOf(address(this));
        require (balance > minRootedBalance);
        rootedToken.transfer(msg.sender, balance - minRootedBalance);
    }

    function rootUsdBaseRoot(uint256 rootedAmount, uint256 minAmountOut) public arbitrageurOnly() {
        uint baseAmount = sellRootedToken(address(baseToken), rootedAmount, 0);
        uint usdAmount = usdBaseSwap(baseAmount);
        uint rootedAmountOut =  buyRootedToken(address(baseToken), usdAmount, minAmountOut);
        require(rootedAmountOut > rootedAmount, "No profit");
    }

    function rootBaseUsdRoot(uint256 rootedAmount, uint256 minAmountOut) public arbitrageurOnly() {
        uint usdAmount = sellRootedToken(address(usdToken), rootedAmount, 0);
        uint baseAmount = baseUsdSwap(usdAmount);
        uint rootedAmountOut = buyRootedToken(address(baseToken), baseAmount, minAmountOut);
        require(rootedAmountOut > rootedAmount, "No profit");
    }

    function rootBaseEliteRoot(uint256 rootedAmount, uint256 minAmountOut) public arbitrageurOnly() {
        uint256 baseAmount = sellRootedToken(address(baseToken), rootedAmount, 0);
        eliteToken.depositTokens(baseAmount);
        uint256 rootedAmountOut = buyRootedToken(address(eliteToken), baseAmount, minAmountOut);
        require(rootedAmountOut > rootedAmount, "No profit");
    }

    function rootEliteBaseRoot(uint256 rootedAmount, uint256 minAmountOut) public arbitrageurOnly() {
        uint256 eliteAmount = sellRootedToken(address(eliteToken), rootedAmount, 0);
        eliteToken.withdrawTokens(eliteAmount);
        uint256 rootedAmountOut = buyRootedToken(address(baseToken), eliteAmount, minAmountOut);
        require(rootedAmountOut > rootedAmount, "No profit");
    }

    //internal
    function buyRootedToken(address token, uint256 amountToSpend, uint256 minAmountOut) private returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = address(token);
        path[1] = address(rootedToken);
        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(amountToSpend, minAmountOut, path, address(this), block.timestamp);
        return amounts[1];
    }

    function sellRootedToken(address token, uint256 amountToSpend, uint256 minAmountOut) private returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = address(rootedToken);
        path[1] = address(token); 
        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(amountToSpend, minAmountOut, path, address(this), block.timestamp);    
        return amounts[1];
    }

    function usdBaseSwap(uint256 amountToSpend) private returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = address(usdToken);
        path[1] = address(baseToken); 
        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(amountToSpend, 0, path, address(this), block.timestamp);
        return amounts[1];
    }

    function baseUsdSwap(uint256 amountToSpend) private returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = address(baseToken);
        path[1] = address(usdToken); 
        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(amountToSpend, 0, path, address(this), block.timestamp);
        return amounts[1];
    }
}
