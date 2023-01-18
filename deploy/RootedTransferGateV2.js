module.exports = async function ({ deployments, getNamedAccounts }) {
	const { deploy } = deployments
	const { deployer } = await getNamedAccounts()

	const rootedToken = "0xe6a11F125a834E0676F3f8f33eb347D4e1938264"
	const feeSplitter = "0x96E5b9e7bc0eC533385e18572b9155f9656ad735"

	await deploy("RootedTransferGateV2", {
		from: deployer,
		args: [rootedToken, feeSplitter],
		log: true,
		waitConfirmations: 1,
	})
}

module.exports.tags = ["RootedTransferGateV2"]