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

    bool public unrestricted;
    mapping (address => bool) public liquidityControllers;
    mapping (address => bool) public feeControllers;
    mapping (address => bool) public  freeParticipants;

    address public override feeSplitter;
    uint16 public feesRate;
    uint16 public liquidityIncreaseRate;
   
    uint16 public dumpTaxStartRate;
    uint256 public dumpTaxDurationInSeconds;
    uint256 public dumpTaxEndTimestamp;

    bool public transferInProgress;

    constructor(LiquidityLockedERC20 _rootedToken, address _feeSplitter)
    {
        rootedToken = _rootedToken;
        feeSplitter = _feeSplitter;
    }

    function setFeeSplitter(address _feeSplitter) public ownerOnly()
    {
        feeSplitter = _feeSplitter;
    }

    function setLiquidityIncreaseRate(uint16 _liquidityIncreaseRate) public ownerOnly()
    {
        require (_liquidityIncreaseRate <= 9900, "Fee rate must be less than or equal to 99%");
        liquidityIncreaseRate = _liquidityIncreaseRate;
    }
    
    function setFeeControllers(address feeController, bool allow) public ownerOnly()
    {
        feeControllers[feeController] = allow;
    }

    // sets an address to be fee exempt
    function setFreeParticipant(address participant, bool free) public
    {
        require (msg.sender == owner || feeControllers[msg.sender], "Not an owner or free participant controller");
        freeParticipants[participant] = free;
    }

    // sets global extra tax rate, declines over time
    function setDumpTax(uint16 startTaxRate, uint256 durationInSeconds) public
    {
        require (feeControllers[msg.sender] || msg.sender == owner, "Not an owner or fee controller");
        require (startTaxRate <= 10000, "Dump tax rate must be less than or equal to 100%");

        dumpTaxStartRate = startTaxRate;
        dumpTaxDurationInSeconds = durationInSeconds;
        dumpTaxEndTimestamp = block.timestamp + durationInSeconds;
    }

    // sets global fee rate
    function setFees(uint16 _feesRate) public
    {
        require (feeControllers[msg.sender] || msg.sender == owner, "Not an owner or fee controller");
        require (_feesRate <= 10000, "Fee rate must be less than or equal to 100%");
        feesRate = _feesRate;
    }

    // removes fees from all transfers
    function setUnrestricted(bool _unrestricted) public
    {
        require (feeControllers[msg.sender] || msg.sender == owner, "Not an unrestricted controller");
        unrestricted = _unrestricted;
    }

    function handleTransfer(address, address from, address to, uint256 amount) public virtual override returns (uint256)
    {
        if (transferInProgress) {
            return 0;
        }

        uint taxRate = getTaxRate();

        IUniswapV2Pair pair = IUniswapV2Pair(from);
        
        if (rootedToken.liquidityPairLocked(pair) && liquidityIncreaseRate > 0) {

            rootedToken.setLiquidityLock(pair, false);

            IERC20 pairedToken = IERC20(getPairedToken(pair));

            (uint112 pairedReserves, uint112 rootedReserves,) = pair.getReserves();
            (pairedReserves, rootedReserves) = address(rootedToken) > address(pairedToken) ? (pairedReserves, rootedReserves) : (rootedReserves, pairedReserves);

            uint256 pairedBalance = pairedToken.balanceOf(address(pair));
            require(pairedBalance > pairedReserves);

            uint256 amountOut = getAmountOut(pairedBalance - pairedReserves, pairedReserves, rootedReserves);
            uint256 amountAfterFee = amountOut - (amountOut * taxRate / 10000);
            require (amount <= amountAfterFee); 
  
            transferInProgress = true;
            rootedToken.transfer(from, amount * liquidityIncreaseRate / 10000);
            transferInProgress = false;

            rootedToken.setLiquidityLock(pair, false);
        }

        if (unrestricted || freeParticipants[from] || freeParticipants[to]) {
            return 0;
        }

        return amount * taxRate / 10000;
    }

    function getTaxRate() private view returns (uint) {
        uint dumpTax = block.timestamp >= dumpTaxEndTimestamp ? 0 : dumpTaxStartRate*(dumpTaxEndTimestamp - block.timestamp)*1e18/dumpTaxDurationInSeconds/1e18;
        uint totalTax = feesRate + dumpTax;
        return totalTax = totalTax > 10000 ? 10000 : totalTax;
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