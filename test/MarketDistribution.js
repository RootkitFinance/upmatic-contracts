// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { createUniswap } = require("./helpers");
// const { utils, constants } = require("ethers");

// describe("MarketDistribution", function () {
//     let owner, dev, user1, user2, user3, rootedToken, baseToken, eliteToken, rootedBaseLp, marketGeneration, marketDistribution, rootedTransferGate, uniswap, vault;

//     beforeEach(async function () {
//         [owner, dev, user1, user2, user3, vault] = await ethers.getSigners();

//         const rootedTokenFactory = await ethers.getContractFactory("RootedToken");
//         rootedToken = await rootedTokenFactory.connect(owner).deploy();
//         const baseTokenFactory = await ethers.getContractFactory("WETH9");
//         baseToken = await baseTokenFactory.connect(owner).deploy();
//         const eliteTokenFactory = await ethers.getContractFactory("EliteToken");
//         eliteToken = await eliteTokenFactory.connect(owner).deploy(baseToken.address);
//         uniswap = await createUniswap(owner, baseToken);

//         const marketGenerationFactory = await ethers.getContractFactory("MarketGeneration");
//         marketGeneration = await marketGenerationFactory.connect(owner).deploy(dev.address, baseToken.address);

//         const marketDistributionFactory = await ethers.getContractFactory("MarketDistribution");
//         marketDistribution = await marketDistributionFactory.connect(owner).deploy(dev.address);
//         await marketDistribution.connect(owner).init(rootedToken.address, eliteToken.address, vault.address, uniswap.router.address, marketGeneration.address, "1", "1888", "188", "7888", "1888");

//         const rootedTransferGateFactory = await ethers.getContractFactory("RootedTransferGate");
//         rootedTransferGate = await rootedTransferGateFactory.connect(owner).deploy(rootedToken.address, uniswap.router.address);

//         const freeParticipantRegistryFactory = await ethers.getContractFactory("FreeParticipantRegistry");
//         const freeParticipantRegistry = await freeParticipantRegistryFactory.connect(owner).deploy();

//         const blackListRegistryFactory = await ethers.getContractFactory("BlackListRegistry");
//         const blackListRegistry = await blackListRegistryFactory.connect(owner).deploy();

//         await rootedTransferGate.setBlackListRegistry(blackListRegistry.address);
//         await rootedTransferGate.setFreeParticipantRegistry(freeParticipantRegistry.address);
//         await freeParticipantRegistry.setTransferGate(rootedTransferGate.address);

//         await rootedToken.connect(owner).setTransferGate(rootedTransferGate.address);
//         await rootedTransferGate.connect(owner).setUnrestrictedController(marketDistribution.address, true);
//         await eliteToken.connect(owner).setSweeper(marketDistribution.address, true);
//         await rootedToken.connect(owner).setLiquidityController(rootedTransferGate.address, true);

        

//         await rootedToken.connect(owner).setMinter(marketDistribution.address);
//         await marketGeneration.connect(owner).activate(marketDistribution.address);

//         await user1.sendTransaction({ to: marketGeneration.address, value: utils.parseEther("1") });
//         await user2.sendTransaction({ to: marketGeneration.address, value: utils.parseEther("2") });
//         await marketGeneration.connect(user3).contribute(user1.address, { value: utils.parseEther("3") });
//     })

//     it("initializes as expected", async function () {
//         expect(await marketDistribution.totalBaseTokenCollected()).to.equal(0);
//         expect(await marketDistribution.devCutPercent()).to.equal(1888);
//         expect(await marketDistribution.preBuyForReferralsPercent()).to.equal(188);
//         expect(await marketDistribution.preBuyForContributorsPercent()).to.equal(7888);
//         expect(await marketDistribution.preBuyForMarketStabilizationPercent()).to.equal(1888);
//         expect(await uniswap.factory.getPair(eliteToken.address, rootedToken.address)).to.equal(constants.AddressZero);
//         expect(await uniswap.factory.getPair(baseToken.address, rootedToken.address)).to.equal(constants.AddressZero);
//     })

//     it("completeSetup() can't be called by non-owner", async function () {
//         await expect(marketDistribution.connect(user1).completeSetup()).to.be.revertedWith("Owner only");
//     })

//     it("reverts claim() because distribution is not completed", async function () {
//         await expect(marketGeneration.connect(user1).claim()).to.be.revertedWith("Distribution is not completed");
//     })

//     it("reverts claimReferralRewards() because distribution is not completed", async function () {
//         await expect(marketGeneration.connect(user1).claimReferralRewards()).to.be.revertedWith("Distribution is not completed");
//     })

//     describe("setupEliteRooted(), setupBaseRooted(), completeSetup(), complete() called", function () {

//         beforeEach(async function () {
//             await marketDistribution.connect(owner).setupEliteRooted();
//             await marketDistribution.connect(owner).setupBaseRooted();
//             await marketDistribution.connect(owner).completeSetup();

//             const eliteFloorCalculatorFactory = await ethers.getContractFactory("EliteFloorCalculator");
//             const eliteFloorCalculator = await eliteFloorCalculatorFactory.connect(owner).deploy(rootedToken.address, eliteToken.address, baseToken.address, uniswap.factory.address, uniswap.router.address);
//             await eliteToken.connect(owner).setFloorCalculator(eliteFloorCalculator.address);

//             rootedBaseLp = await uniswap.factory.getPair(baseToken.address, rootedToken.address);
//             await rootedTransferGate.connect(owner).setMainPool(rootedBaseLp);
//             await rootedTransferGate.connect(owner).setPoolTaxRate(rootedBaseLp, "1000");
//             await marketGeneration.connect(owner).complete();
//         })

//         it("initialized as expected", async function () {
//             expect(await marketDistribution.totalBaseTokenCollected()).to.equal(utils.parseEther("6"));
//             expect(await rootedToken.totalSupply()).to.equal(utils.parseEther("10000000"));
//             expect(await uniswap.factory.getPair(eliteToken.address, rootedToken.address)).not.to.equal(constants.AddressZero);
//             expect(await uniswap.factory.getPair(baseToken.address, rootedToken.address)).not.to.equal(constants.AddressZero);
//         })

//         it("distributed as expected", async function() {
//             expect(await marketDistribution.totalBoughtForReferrals()).not.to.equal(0);
//             expect(await baseToken.balanceOf(dev.address)).not.to.equal(0);
//             expect(await baseToken.balanceOf(vault.address)).not.to.equal(0);
//         })

//         it("claim works as expected", async function() {
//             await marketGeneration.connect(user1).claim();
//             await marketGeneration.connect(user2).claim();
//             await marketGeneration.connect(user3).claim();

//             expect(await rootedToken.balanceOf(user1.address)).not.to.equal(0);
//             expect(await rootedToken.balanceOf(user2.address)).not.to.equal(0);
//             expect(await rootedToken.balanceOf(user3.address)).not.to.equal(0);
//         })

//         it("claimReferralRewards works as expected", async function() {
//             await marketGeneration.connect(user1).claimReferralRewards();
//             await marketGeneration.connect(user3).claimReferralRewards();

//             expect(await rootedToken.balanceOf(user1.address)).not.to.equal(0);
//             expect(await rootedToken.balanceOf(user3.address)).not.to.equal(0);
//         }) 
//     })
// })