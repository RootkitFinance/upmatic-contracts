const hre = require("hardhat");
const ethers = hre.ethers;

const forkFrom = "https://polygon-rpc.com/";

const UniswapV2PairJson = require('../contracts/json/UniswapV2Pair.json');
const UniswapV2FactoryJson = require('../contracts/json/UniswapV2Factory.json');
const UniswapV2Router02Json = require('../contracts/json/UniswapV2Router02.json');
const { utils, constants } = require("ethers");

describe("MGE", function() {
    let tempAccount;
    let uniswapV2Factory, uniswapV2Router, rooted, deployer, dev, base, elite;
    let rootedBase, rootedElite;
    let transferGate;
    let marketGeneration;
    let marketDistribution;
    let eliteFloorCalculator;

    async function impersonate(address) {
        await hre.network.provider.request({ method: "hardhat_impersonateAccount", params: [address] }); 
        return await ethers.provider.getSigner(address);
    }

    async function reset() {
        await hre.network.provider.request({ method: "hardhat_reset", params: [{forking: { jsonRpcUrl: forkFrom }}] });
    }

    beforeEach(async function() {
        await reset();
        
        [tempAccount] = await ethers.getSigners();
        rootKitDeployer = await impersonate("0x804CC8D469483d202c69752ce0304F71ae14ABdf");
        dev = await impersonate("0x30d1db7f73C7f9819e0676F5052D3B2D45FF3Fe5");
        marketGeneration = await ethers.getContractAt("MarketGeneration", "0xd19C171e43285E4cc31d3c749d5d43315e5338d9");
        marketDistribution = await ethers.getContractAt("MarketDistribution", "0x0ac1B94d97761654099403a17D77E4EF5D554b8F");
        rooted = await ethers.getContractAt("RootedToken", "0xe6a11F125a834E0676F3f8f33eb347D4e1938264");
        elite = await ethers.getContractAt("EliteToken", "0x63ed7f9D97d6658E46dDA23e50DdF82D86070580");
        uniswapV2Factory = new ethers.Contract("0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32", UniswapV2FactoryJson.abi, tempAccount);
        uniswapV2Router = new ethers.Contract("0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", UniswapV2Router02Json.abi, tempAccount);
        base = await uniswapV2Router.WETH();
        transferGate = await ethers.getContractAt("RootedTransferGate", "0xf40e1Ad286872f4a43E2FF5ca294e8F4b7772F36");
        eliteFloorCalculator = await ethers.getContractAt("EliteFloorCalculator", "0x387B14c7F3D72679314567A063735f63632B127f");
        })

        it("calls complete", async function() {
            const contribution = await marketGeneration.connect(rootKitDeployer).contribution(rootKitDeployer._address);
            const referralPoints = await marketGeneration.connect(rootKitDeployer).referralPoints(dev._address);

            //console.log(utils.formatEther(contribution.toString()));
            console.log(utils.formatEther(referralPoints.toString()));

            await marketGeneration.connect(rootKitDeployer).complete();
            //await marketGeneration.connect(rootKitDeployer).claim();
            await marketGeneration.connect(dev).claimReferralRewards();

            const rootBalanceDev = await rooted.balanceOf(dev._address);
            const rootBalanceDist = await rooted.balanceOf(marketDistribution.address);
            const totalBoughtForReferrals = await marketDistribution.totalBoughtForReferrals();

            console.log("Dev Balance                ", utils.formatEther(rootBalanceDev.toString()));
            console.log("Total Bought For Referrals ", utils.formatEther(totalBoughtForReferrals.toString()));
            console.log("Distribution Balance       ", utils.formatEther(rootBalanceDist.toString()));
        }).timeout(2e12)
})