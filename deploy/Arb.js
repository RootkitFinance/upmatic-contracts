module.exports = async function ({ deployments, getNamedAccounts}) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const base = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
    const usd = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    const elite = "0xcd0610e3b1Af3d86D4E046648B3BFE412b64c6F1"

    const rooted = "0xe6a11F125a834E0676F3f8f33eb347D4e1938264"
    const router = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"
    const gate = "0xE1a3bAEB559DD858C6DbeC54eA6521dcE38cD986"
    const mSig = "0x8295aDa05d34E9205986aE4f69Bc0615bdaaa027"

    await deploy("Arb", {
        from: deployer,
        args: [base, usd, elite, rooted, router, gate, mSig],
        log: true,
        waitConformations: 1,
    })
}

module.exports.tags = ["Arb"]
