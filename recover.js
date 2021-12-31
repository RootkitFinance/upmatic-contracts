// 1. In the REMIX compile 
//      ITokensRecoverable
//      IERC20
// 2. Right click on the script name and hit "Run" to execute
(async () => {
    try {
        console.log('Running deploy script...')

        const deployer = "0x804CC8D469483d202c69752ce0304F71ae14ABdf";
        const router = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
        const baseToken = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
        const eliteToken = "0x63ed7f9D97d6658E46dDA23e50DdF82D86070580";
        const rootedToken = "0xe6a11F125a834E0676F3f8f33eb347D4e1938264";
        const basePool = "0x928ed5a1259b1ce7b7c99ac5f100cf0db16b424e";
        const elitePool = "0xF63E5bfDC51C0236Ef662f02738c482f91f37B24";
        const transferGate = "0xf40e1Ad286872f4a43E2FF5ca294e8F4b7772F36";
        const calculator = "0x387b14c7f3d72679314567a063735f63632b127f";
        const oldVault = "0xD63a09dEf429E7Aa11c46aD02A011552AE9cE5AF";
        const bot = "0x439Fd1FDfF5D1c46F67220c7C38d04F366372332";
        const newVault = "0xbF73c34ef413DbfbbDF35C935aAC0D422D7F3C28";

        const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner();
        
        
        //=======================================================================================
        //                                      RECOVER TOKENS
        //=======================================================================================

        const tokensRecoverableMetadata = JSON.parse(await remix.call('fileManager', 'getFile', `browser/artifacts/ITokensRecoverable.json`));
        const tokensRecoverableFactory = new ethers.ContractFactory(tokensRecoverableMetadata.abi, tokensRecoverableMetadata.data.bytecode.object, signer);  
        const oldVaultContract = await tokensRecoverableFactory.attach(oldVault);        
        const erc20Metadata = JSON.parse(await remix.call('fileManager', 'getFile', `browser/artifacts/IERC20.json`));
        const erc20Factory = new ethers.ContractFactory(erc20Metadata.abi, erc20Metadata.data.bytecode.object, signer);  
        
        // Recovering Base from Vault
        let baseContract = await erc20Factory.attach(baseToken);
        let balanceBefore = await baseContract.balanceOf(deployer);
        txResponse = await oldVaultContract.recoverTokens(baseToken);
        await txResponse.wait();
        let balanceAfter = await baseContract.balanceOf(deployer);
        let recovered = balanceAfter.sub(balanceBefore);
        await baseContract.transfer(newVault, recovered);
        console.log(`${ethers.utils.formatEther(recovered)} Base tokens recovered and sent to the new vault`);

        // Recovering Elite from Vault
        txResponse = await oldVaultContract.recoverTokens(eliteToken);
        await txResponse.wait();
        recovered = await eliteContract.balanceOf(deployer);
        await eliteContract.transfer(newVault, recovered);
        console.log(`${ethers.utils.formatEther(recovered)} Elite tokens recovered and sent to the new vault`);

        // Recovering Rooted from Vault
        let rootedContract = await erc20Factory.attach(rootedToken);
        balanceBefore = await rootedContract.balanceOf(deployer);
        txResponse = await oldVaultContract.recoverTokens(rootedToken);
        await txResponse.wait();
        balanceAfter = await rootedContract.balanceOf(deployer);
        recovered = balanceAfter.sub(balanceBefore);
        await rootedContract.transfer(newVault, recovered);
        console.log(`${ethers.utils.formatEther(recovered)} Rooted tokens recovered and sent to the new vault`);

        // Recovering Base Pool LPs from Vault
        const basePoolContract = await erc20Factory.attach(basePool);
        txResponse = await oldVaultContract.recoverTokens(basePool);
        await txResponse.wait();
        recovered = await basePoolContract.balanceOf(deployer);        
        await basePoolContract.transfer(newVault, recovered);
        console.log(`${ethers.utils.formatEther(recovered)} Base Pool LPs recovered and sent to the new vault`);

        // Recovering Elite Pool LPs from Vault
        const elitePoolContract = await erc20Factory.attach(elitePool);
        txResponse = await oldVaultContract.recoverTokens(elitePool);
        await txResponse.wait();
        recovered = await elitePoolContract.balanceOf(deployer);
        await elitePoolContract.transfer(newVault, recovered);
        console.log(`${ethers.utils.formatEther(recovered)} Elite Pool LPs recovered and sent to the new vault`);

        console.log('Done!');
    } 
    catch (e) {
        console.log(e)
    }
})()