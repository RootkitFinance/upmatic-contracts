module.exports = async function ({ deployments, getNamedAccounts }) {
	const { deploy } = deployments
	const { deployer } = await getNamedAccounts()

	const rootedToken = "0xe6a11F125a834E0676F3f8f33eb347D4e1938264"
	const feeSplitter = "0x96E5b9e7bc0eC533385e18572b9155f9656ad735"
	const basePair = "0x928ed5a1259b1ce7b7c99ac5f100cf0db16b424e"
	const elitePair = "0x5B06c3600dafdd2B11e0127316BfD8604D31d428"
	const usdPair = "0xC58801771DBaDA5464305fE4806F23e836c48fdD"

	await deploy("RootedTransferGateV2", {
		from: deployer,
		args: [rootedToken, feeSplitter, basePair, elitePair, usdPair],
		log: true,
		waitConfirmations: 1,
	})
}

module.exports.tags = ["RootedTransferGateV2"]

