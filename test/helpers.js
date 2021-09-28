const { ethers } = require("hardhat");
const { utils } = require("ethers");

const PancakePairJson = require('../contracts/json/UniswapV2Pair.json');
const PancakeFactoryJson = require('../contracts/json/UniswapV2Factory.json');
const UniswapV2Router02Json = require('../contracts/json/UniswapV2Router02.json');
const UniswapV2LibraryJson = require('../contracts/json/UniswapV2Library.json');

exports.createUniswap = async function(owner) {
    const erc20Factory = await ethers.getContractFactory("ERC20Test");
    const weth = await erc20Factory.connect(owner).deploy();
    const factory = await new ethers.ContractFactory(PancakeFactoryJson.abi, PancakeFactoryJson.bytecode, owner).deploy(owner.address);
    const router = await new ethers.ContractFactory(UniswapV2Router02Json.abi, UniswapV2Router02Json.bytecode, owner).deploy(factory.address, weth.address);
    const library = await new ethers.ContractFactory(UniswapV2LibraryJson.abi, UniswapV2LibraryJson.bytecode, owner).deploy();
    return {
        factory,
        router,
        library,
        weth,
        pairFor: address => new ethers.Contract(address, PancakePairJson.abi, owner)
    };
}