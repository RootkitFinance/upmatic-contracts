module.exports = async function (taskArgs, hre) {

	const vaultAddress = "0x6140c850140175f25ce0798f41aec9829458eb28"
	const msigAddress = "0x8295aDa05d34E9205986aE4f69Bc0615bdaaa027"
	const feeSplitterAddress = "0x96E5b9e7bc0eC533385e18572b9155f9656ad735"
	const iBotAddress = "0xF983572c66368c94359B5F954313bF6650d5A6B6"
	const oldDeployerAddress = "0x804CC8D469483d202c69752ce0304F71ae14ABdf"

	const gate = await hre.ethers.getContract("RootedTransferGateV2")
	const adder = await hre.ethers.getContract("SingleSideLiquidityAdder")
	const vault = await hre.ethers.getContractAt("Vault", vaultAddress)

	console.log("Gate     ", gate.address)
	console.log("Vault      ", vault.address)

	const signers = await hre.ethers.getSigners()
	const deployer = signers[0]
	
	console.log("Deployer ", deployer.address)

	const gasPrice = await hre.ethers.provider.getGasPrice()
	const increasedGasPrice = gasPrice.mul(4)

	/*
	// set controllers in gate
	const setController01 = await gate.setControllers(vaultAddress, true, {gasPrice: increasedGasPrice})
	await setController01.wait()
	console.log("setController01 tx hash       ", setController01.hash)

	const setController02 = await gate.setControllers(deployer.address, true, {gasPrice: increasedGasPrice})
	await setController02.wait()
	console.log("setController02 tx hash       ", setController02.hash)

	const setController03 = await gate.setControllers(adder.address, true, {gasPrice: increasedGasPrice})
	await setController03.wait()
	console.log("setController03 tx hash       ", setController03.hash)
		*/

		const setFreeParticipant = await gate.setFreeParticipant(oldDeployerAddress, true, {gasPrice: increasedGasPrice})
		await setFreeParticipant.wait()
		console.log("setFreeParticipant tx hash  ", setFreeParticipant.hash)
	
	/*
	// set free participants in gate x6
	const setFreeParticipant01 = await gate.setFreeParticipant(adder.address, true, {gasPrice: increasedGasPrice})
	await setFreeParticipant01.wait()
	console.log("setFreeParticipant01 tx hash  ", setFreeParticipant01.hash)

		
	const setFreeParticipant02 = await gate.setFreeParticipant(deployer.address, true, {gasPrice: increasedGasPrice})
	await setFreeParticipant02.wait()
	console.log("setFreeParticipant02 tx hash  ", setFreeParticipant02.hash)

	const setFreeParticipant03 = await gate.setFreeParticipant(iBotAddress, true, {gasPrice: increasedGasPrice})
	await setFreeParticipant03.wait()
	console.log("setFreeParticipant03 tx hash  ", setFreeParticipant03.hash)

	const setFreeParticipant04 = await gate.setFreeParticipant(vaultAddress, true, {gasPrice: increasedGasPrice})
	await setFreeParticipant04.wait()
	console.log("setFreeParticipant04 tx hash  ", setFreeParticipant04.hash)

	const setFreeParticipant05 = await gate.setFreeParticipant(feeSplitterAddress, true, {gasPrice: increasedGasPrice})
	await setFreeParticipant05.wait()
	console.log("setFreeParticipant05 tx hash  ", setFreeParticipant05.hash)

	const setFreeParticipant06 = await gate.setFreeParticipant(msigAddress, true, {gasPrice: increasedGasPrice})
	await setFreeParticipant06.wait()
	console.log("setFreeParticipant06 tx hash  ", setFreeParticipant06.hash)

	// set bots in adder x2
	const setBot01 = await adder.setController(deployer.address, true, {gasPrice: increasedGasPrice})
	await setBot01.wait()
	console.log("setBot01 tx hash			   ", setBot01.hash)
	
	const setBot02 = await adder.setController(iBotAddress, true, {gasPrice: increasedGasPrice})
	await setBot02.wait()
	console.log("setBot02 tx hash			   ", setBot02.hash)


	//transfer ownership of gate and adder x2
	const xferGateOwner = await gate.transferOwnership(msigAddress, {gasPrice: increasedGasPrice})
	await xferGateOwner.wait()
	console.log("xferGateOwner tx hash		   ", xferGateOwner.hash)

	const xferAdderOwner = await adder.transferOwnership(msigAddress, {gasPrice: increasedGasPrice})
	await xferAdderOwner.wait()
	console.log("xferAdderOwner tx hash		   ", xferAdderOwner.hash)
	*/
	/*
		free participants to set in gate
		- iBotAddress
		- deployer
		- vault
		- adder
		- msig
		- feeSplitter

		controllers to set in gate
		- vault
		- single side
		- deployer

		controllers to set in adder
		- iBot
		- deployer

		ownership to transfer
		- gate to msig
		- single side to msig


	*/

	
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