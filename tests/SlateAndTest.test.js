const { expect } = require('chai')
require('dotenv').config()

if (process.env.BLOCKCHAIN_NETWORK != 'hardhat') {
    console.error(
        'Exited testing with network:',
        process.env.BLOCKCHAIN_NETWORK
    )
    process.exit(1)
}

async function getSigners(name, ...params) {
    //deploy the contract
    const ContractFactory = await ethers.getContractFactory(name)
    const contract = await ContractFactory.deploy(...params)
    await contract.deployed()
    //get the signers
    const signers = await ethers.getSigners()
    //attach contracts
    for (let i = 0; i < signers.length; i++) {
        const Contract = await ethers.getContractFactory(name, signers[i])
        signers[i].withContract = await Contract.attach(contract.address)
    }

    return signers
}

function hashToken(collectionId, recipient) {
    return Buffer.from(
        ethers.utils
            .solidityKeccak256(
                ['uint256', 'address'],
                [collectionId, recipient]
            )
            .slice(2),
        'hex'
    )
}

describe('SlateAndTell Tests', function () {
    before(async function () {
        const [
            contractOwner,
            tokenOwner1,
            tokenOwner2,
            tokenOwner3,
            tokenOwner4,
        ] = await getSigners('SlateAndTell', 'http://example.com/')

        this.signers = {
            contractOwner,
            tokenOwner1,
            tokenOwner2,
            tokenOwner3,
            tokenOwner4,
        }
    })
    it('Should mint', async function () {
        const { contractOwner, tokenOwner1 } = this.signers
        await contractOwner.withContract.mint(tokenOwner1.address, 'lol')
        expect(await contractOwner.withContract.ownerOf(1)).to.equal(
            tokenOwner1.address
        )
    })
})
