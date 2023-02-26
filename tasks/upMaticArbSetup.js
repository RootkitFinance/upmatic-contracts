module.exports = async function (taskArgs, hre) {
	//const gate = await ethers.getContract("RootedTransferGateV2")
	//const arb = await ethers.getContract("Arb")

	const vault = "0x6140c850140175f25ce0798f41aec9829458eb28"
	const msig = "0x8295aDa05d34E9205986aE4f69Bc0615bdaaa027"
	const feeSplitter = "0x96E5b9e7bc0eC533385e18572b9155f9656ad735"

	const testBotAddress = "0xF983572c66368c94359B5F954313bF6650d5A6B6"

	
	console.log("Gate     ", gate.address)
	console.log("Arb      ", arb.address)

	const signers = await ethers.getSigners()
	const deployer = signers[0]
	
	console.log("Deployer ", deployer.address)

	

	
/*
		//set manager in arb
	const setManager = await arb.setArbManager(testBotAddress, true)
	await setManager.wait()
	console.log("setManager tx hash				", setManager.transactionHash)

	
		//arb settings in gate
	const setArbController = await gate.setFeeControllers(arb.address, true)
	await setArbController.wait()
	console.log("setFeeControllers tx hash       ", setArbController.transactionHash)

	

	const setArbFree = await gate.setFreeParticipant(arb.address, true)
	await setArbFree.wait()
	console.log("setArbFree tx hash				", setArbFree.transactionHash)

		// gate system settings
	// liquidity Increse Rate
	const setIncreseRate = await gate.setLiquidityIncreaseRate("5000")
	await setIncreseRate.wait()
	console.log ("setIncreseRate tx hash		", setIncreseRate.transactionHash)

	// fees
	const setFees = await gate.setFees("369")
	await setFees.wait()
	console.log ("setFees tx hash				 ", setFees.transactionHash)

	// fee splitter
	const setFeeSplitter = await gate.setFeeSplitter(feeSplitter)
	await setFeeSplitter.wait()
	console.log("setFeeSplitter tx hash			", setFeeSplitter.transactionHash)

	// unrestricted
	const setUnrestricted = await gate.setUnrestricted(false)
	await setUnrestricted.wait()
	console.log("setUnrestricted tx hash		", setUnrestricted.transactionHash)


		// vault settings
	// fee controllers
	const setFeeControllers = await gate.setFeeControllers(vault, true)
	await setFeeControllers.wait()
	console.log("setFeeControllers tx hash		", setFeeControllers.transactionHash)

	// free participant
	const setFreeParticipant = await gate.setFreeParticipant(vault, true)
	await setFreeParticipant.wait()
	console.log("setFreeParticipant tx hash		", setFreeParticipant.transactionHash)

	
	
		// msig settings in gate
	// set as free user
	const setMsigFree = await gate.setFreeParticipant(msig, true)
	await setMsigFree.wait()
	console.log("setMsigFree tx hash			", setMsigFree.transactionHash)
		
	// transfer ownership to vault
	const setMsigOwner = await arb.transferOwnership(msig)
	await setMsigOwner.wait()
	console.log("setMsigOwner tx hash			", setMsigOwner.transactionHash)

	*/

}