module.exports = async function (taskArgs, hre) {
	const gate = await ethers.getContract("RootedTransferGateV2")
	const arb = await ethers.getContract("Arb")
	
	console.log("Gate     ", gate.address)
	console.log("Arb      ", arb.address)

	const signers = await ethers.getSigners()
	const deployer = signers[0]
	
	console.log("Deployer ", deployer.address)

	const tx = await gate.setFeeControllers(arb.address, true)
	await tx.wait()
	console.log("tx       ", tx.transactionHash)
}