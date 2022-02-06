//to run this on testnet:
// $ npx hardhat run scripts/deploy.js

const hardhat = require('hardhat')

async function main() {
  await hre.run('compile')
  const NFT = await hardhat.ethers.getContractFactory('SlateAndTell')
  const nft = await NFT.deploy('https://ipfs.io/ipfs/bafkreictw7fbeeuxeysa2lsxmdvxdz532ri4j5jni4fvlsnc2xxzrhbzrm')
  await nft.deployed()
  console.log('NFT contract deployed to (update .env):', nft.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});
