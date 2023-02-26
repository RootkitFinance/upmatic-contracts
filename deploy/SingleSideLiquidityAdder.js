module.exports = async function ({ deployments, getNamedAccounts }) {
	const { deploy } = deployments
	const { deployer } = await getNamedAccounts()

	const rootedToken = "0xe6a11F125a834E0676F3f8f33eb347D4e1938264"
	const gate = "0x155C027cAA72235F6d1429D1ee2C8Ce99187394c"
	const router = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"

	const gasPrice = await hre.ethers.provider.getGasPrice()
	const increasedGasPrice = gasPrice.mul(5)

	await deploy("SingleSideLiquidityAdder", {
		from: deployer,
		args: [rootedToken, gate, router],
		log: true,
		waitConfirmations: 1,
		gasPrice: increasedGasPrice,
	})
}

module.exports.tags = ["SingleSideLiquidityAdder"]

