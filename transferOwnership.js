// 1. Double check addresses
// 2. In the REMIX compile IOwned
// 3. Right click on the script name and hit "Run" to execute

(async () => {
	try {
		const newOwner = "0x8295aDa05d34E9205986aE4f69Bc0615bdaaa027";
		const arbitrage = "0x36d45358CeEC6D8fF80572d0210aaCA9c66E3F66";
		const blackListRegistry = "0x2Cc5c9cb917358B6f1fb512293152d30C4F541Dd";
		const calculator = "0x387b14c7f3d72679314567a063735f63632b127f";
		const elite = "0x63ed7f9D97d6658E46dDA23e50DdF82D86070580";
		const rooted = "0xe6a11F125a834E0676F3f8f33eb347D4e1938264"
		const feeSplitter = "0x96E5b9e7bc0eC533385e18572b9155f9656ad735"
		const freeParticipantRegistry = "0x5149Fb6c5AC4ABe65f2e1945ef7BBDad3604eE75"
		const singleSideLiquidityAdder = "0x0bb85BA8A6C56A0952ffDB216d67Cf78879eE5A9"
		const stakingToken = "0x6995c181Aae9fEA21EF5a860297b92Df8A57f7A3"
		const transferGate = "0xf40e1Ad286872f4a43E2FF5ca294e8F4b7772F36";
		const vault = "0xd9E0b819B782CF7e1b554c750964dC4D8c92e1EB";

		const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner();

		const ownedMetadata = JSON.parse(await remix.call('fileManager', 'getFile', `browser/artifacts/IOwned.json`));
		const ownedFactory = new ethers.ContractFactory(ownedMetadata.abi, ownedMetadata.data.bytecode.object, signer);
		const owned = [
			arbitrage,
			blackListRegistry,
			calculator,
			elite,
			rooted,
			feeSplitter,
			freeParticipantRegistry,
			singleSideLiquidityAdder,
			stakingToken,
			transferGate,
			vault
		];

		const arbitrageContract = await ownedFactory.attach(arbitrage);
		const gas = await arbitrageContract.estimateGas.transferOwnership(newOwner);
		const increasedGas = gas.toNumber() * 1.5;

		for (var i = 0; i < owned.length; i++) {
			const contract = await ownedFactory.attach(owned[i]);
			contract.transferOwnership(newOwner, { gasLimit: increasedGas });
		}

		console.log('Done!');
	}
	catch (e) {
		console.log(e)
	}
})()