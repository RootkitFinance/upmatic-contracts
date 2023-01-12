// SPDX-License-Identifier: U-U-U-UPPPPP!!!
pragma solidity ^0.7.6;

/* ROOTKIT:
A transfer gate (GatedERC20) for use with upTokens

It:
    Allows customization of tax and burn rates
    Allows transfer to/from approved pools
    Disallows transfer to/from non-approved pools
    Allows transfer to/from anywhere else
    Allows for free transfers if permission granted
    Allows for unrestricted transfers if permission granted
    Allows for a pool to have an extra tax
    Allows for a temporary declining tax
*/

import "./Address.sol";
import "./IUniswapV2Pair.sol";
import "./LiquidityLockedERC20.sol";
import "./IUniswapV2Router02.sol";
import "./SafeERC20.sol";
import "./SafeMath.sol";
import "./TokensRecoverable.sol";
import "./ITransferGate.sol";
import "./FreeParticipantRegistry.sol";

contract UpOnlyTransferGate is TokensRecoverable, ITransferGate
{   
    using Address for address;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IUniswapV2Router02 immutable internal uniswapRouter;
    LiquidityLockedERC20 immutable internal rootedToken;

    bool public unrestricted;
    mapping (address => bool) public unrestrictedControllers;
    mapping (address => bool) public feeControllers;
    mapping (address => uint16) public poolsTaxRates;

    address public override feeSplitter;
    uint16 public feesRate;
    uint16 public liquidityIncreaseRate;
    FreeParticipantRegistry public freeParticipantRegistry;
   
    uint16 public dumpTaxStartRate; 
    uint256 public dumpTaxDurationInSeconds;
    uint256 public dumpTaxEndTimestamp;

    bool public transferInProgress;

    constructor(LiquidityLockedERC20 _rootedToken, IUniswapV2Router02 _uniswapRouter)
    {
        rootedToken = _rootedToken;
        uniswapRouter = _uniswapRouter;
    }

    function setUnrestrictedController(address unrestrictedController, bool allow) public ownerOnly()
    {
        unrestrictedControllers[unrestrictedController] = allow;
    }
    
    function setFeeControllers(address feeController, bool allow) public ownerOnly()
    {
        feeControllers[feeController] = allow;
    }

    function setFreeParticipantController(address freeParticipantController, bool allow) public ownerOnly()
    {
        freeParticipantRegistry.setFreeParticipantController(freeParticipantController, allow);
    }

    function setFreeParticipant(address participant, bool free) public
    {
        require (msg.sender == owner || freeParticipantRegistry.freeParticipantControllers(msg.sender), "Not an owner or free participant controller");
        freeParticipantRegistry.setFreeParticipant(participant, free);
    }

    function setFeeSplitter(address _feeSplitter) public ownerOnly()
    {
        feeSplitter = _feeSplitter;
    }

    function setUnrestricted(bool _unrestricted, IUniswapV2Pair pool) public
    {
        require (unrestrictedControllers[msg.sender], "Not an unrestricted controller");
        unrestricted = _unrestricted;
        rootedToken.setLiquidityLock(pool, !_unrestricted);
    }

    function setFreeParticipantRegistry(FreeParticipantRegistry _freeParticipantRegistry) public ownerOnly()
    {
        freeParticipantRegistry = _freeParticipantRegistry;
    }

    function setPoolTaxRate(address pool, uint16 taxRate) public ownerOnly()
    {
        require (taxRate <= 10000, "Fee rate must be less than or equal to 100%");
        poolsTaxRates[pool] = taxRate;        
    }

    function setDumpTax(uint16 startTaxRate, uint256 durationInSeconds) public
    {
        require (feeControllers[msg.sender] || msg.sender == owner, "Not an owner or fee controller");
        require (startTaxRate <= 10000, "Dump tax rate must be less than or equal to 100%");

        dumpTaxStartRate = startTaxRate;
        dumpTaxDurationInSeconds = durationInSeconds;
        dumpTaxEndTimestamp = block.timestamp + durationInSeconds;
    }

    function getDumpTax() public view returns (uint256)
    {
        if (block.timestamp >= dumpTaxEndTimestamp) 
        {
            return 0;
        }       
        
        return dumpTaxStartRate*(dumpTaxEndTimestamp - block.timestamp)*1e18/dumpTaxDurationInSeconds/1e18;
    }

    function setFees(uint16 _feesRate) public
    {
        require (feeControllers[msg.sender] || msg.sender == owner, "Not an owner or fee controller");
        require (_feesRate <= 10000, "Fee rate must be less than or equal to 100%");
        feesRate = _feesRate;
    }

    function setLiquidityIncreaseRate(uint16 _liquidityIncreaseRate) public ownerOnly()
    {
        require (_liquidityIncreaseRate <= 9900, "Fee rate must be less than or equal to 99%");
        liquidityIncreaseRate = _liquidityIncreaseRate;
    }

    function handleTransfer(address sender, address from, address to, uint256 amount) public virtual override returns (uint256)
    {
        if (transferInProgress) 
        {
            return 0;
        }      

        IUniswapV2Pair pair = IUniswapV2Pair(from);
        
        if (rootedToken.liquidityPairLocked(pair)) {
            require (sender == address(uniswapRouter));

            IERC20 pairedToken = IERC20(getPairedToken(pair));
            
            (uint112 pairedReserves, uint112 rootedReserves,) = pair.getReserves();
            uint256 pairedBalance = pairedToken.balanceOf(address(pair));
            require(pairedBalance > pairedReserves);

            uint256 amountOut = getAmountOut(pairedBalance.sub(pairedReserves), pairedReserves, rootedReserves);
            uint256 amountAfterFee = amountOut - (amountOut * feesRate / 10000);
            require (amount <= amountAfterFee); 
  
            transferInProgress = true;
            rootedToken.transfer(from, amount * liquidityIncreaseRate / 10000);
            transferInProgress = false;
        }

        if (unrestricted || freeParticipantRegistry.freeParticipant(from) || freeParticipantRegistry.freeParticipant(to)) 
        {
            return 0;
        }

        uint16 poolTaxRate = poolsTaxRates[to];

        if (poolTaxRate > feesRate) 
        {
            uint256 totalTax = getDumpTax() + poolTaxRate;
            return totalTax >= 10000 ? amount : amount * totalTax / 10000;
        }

        return amount * feesRate / 10000;
    }

    function getPairedToken(IUniswapV2Pair pair) private view returns (address){
        address token0 = pair.token0();
        return token0 == address(rootedToken) ? pair.token1() : token0;
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256 amountOut) {
        uint256 amountInWithFee = amountIn.mul(997);
        uint256 numerator = amountInWithFee.mul(reserveOut);
        uint256 denominator = reserveIn.mul(1000).add(amountInWithFee);
        amountOut = numerator / denominator;
    }
}