const { expect } = require("chai")
require("dotenv").config()

if (process.env.BLOCKCHAIN_NETWORK != "hardhat") {
    console.error("Exited testing with network:", process.env.BLOCKCHAIN_NETWORK)
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
            .solidityKeccak256(["uint256", "address"], [collectionId, recipient])
            .slice(2),
        "hex",
    )
}

describe("SlateAndTell Tests", function () {
    const address1 = "0xdbc05b1ecb4fdaef943819c0b04e9ef6df4babd6"
    async function getSatSigners() {
        return await getSigners("SlateAndTell", "http://example.com/", [address1], [1])
    }

    it("Should mint", async function () {
        const [contractOwner, tokenOwner1] = await getSatSigners()
        await contractOwner.withContract.mint(tokenOwner1.address, "lol")
        expect(await contractOwner.withContract.ownerOf(1)).to.equal(tokenOwner1.address)
    })
})

describe("PaymentSplitter Tests", function () {
    const address1 = "0xdbc05b1ecb4fdaef943819c0b04e9ef6df4babd6"
    const address2 = "0x721b68fa152a930f3df71f54ac1ce7ed3ac5f867"
    before(async function () {
        const [contractOwner, tokenOwner1, tokenOwner2, tokenOwner3, tokenOwner4] =
            await getSigners("PaymentSplitter", [address1, address2], [1, 2])

        this.signers = {
            contractOwner,
            tokenOwner1,
            tokenOwner2,
            tokenOwner3,
            tokenOwner4,
        }
    })

    it("Should modify shares", async function () {
        const { contractOwner } = this.signers
        expect(await contractOwner.withContract.totalShares()).to.equal(3)
        await contractOwner.withContract.modifyShares(0, 5)
        expect(await contractOwner.withContract.shares(address1)).to.equal(5)
        expect(await contractOwner.withContract.totalShares()).to.equal(7)
    })
})
