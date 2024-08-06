// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require('fs');
const fse = require("fs-extra");
const { verify } = require('../utils/verify')
const { getAmountInWei, developmentChains } = require('../utils/helper-scripts');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const deployNetwork = hre.network.name

  // test URI
  const baseURI = "ipfs://QmeHfivPyobBjSXtVUv2VHCMmugDRfZ7Qv7QfkrG4BWLQz"

  const maxSupply = 30
  const mintCost = getAmountInWei(0.01)
  const maxMintAmount = 5

  // Deploy KryptoPunks NFT contract 
  console.log("1. Deploying NFT contract...");
  const NFTContract = await ethers.getContractFactory("DollNFT");
  const nftContract = await NFTContract.deploy(maxSupply, mintCost, maxMintAmount);

  await nftContract.deployed();

  const set_tx = await nftContract.setBaseURI(baseURI)
  await set_tx.wait()

  // Deploy KryptoPunks ERC20 token contract 
  console.log("2. Deploying Token contract...");
  const TokenContract = await ethers.getContractFactory("DollFT");
  const tokenContract = await TokenContract.deploy();

  await tokenContract.deployed();

  // Deploy NFTStakingVault contract 
  console.log("3. Deploying Staking contract...");
  const Vault = await ethers.getContractFactory("DollNFTStaking");
  const stakingVault = await Vault.deploy(nftContract.address, tokenContract.address);

  await stakingVault.deployed();

  const control_tx = await tokenContract.setController(stakingVault.address, true)
  await control_tx.wait()

  console.log("DollNFT NFT contract deployed at:\n", nftContract.address);
  console.log("DollFT ERC20 token contract deployed at:\n", tokenContract.address);
  console.log("Doll NFT Staking Vault deployed at:\n", stakingVault.address);
  console.log("Network deployed to :\n", deployNetwork);

  /* transfer contracts addresses & ABIs to the front-end */
  if (fs.existsSync("../front-end/src")) {
    fs.rmSync("../src/artifacts", { recursive: true, force: true });
    fse.copySync("./artifacts/contracts", "../front-end/src/artifacts")
    fs.writeFileSync("../front-end/src/utils/contracts-config.js", `
      export const stakingContractAddress = "${stakingVault.address}"
      export const nftContractAddress = "${nftContract.address}"
      export const tokenContractAddress = "${tokenContract.address}"
      export const ownerAddress = "${stakingVault.signer.address}"
      export const networkDeployedTo = "${hre.network.config.chainId}"
    `)
  }

  if (!developmentChains.includes(deployNetwork) && hre.config.etherscan.apiKey[deployNetwork]) {
    console.log("waiting for 6 blocks verification ...")
    await stakingVault.deployTransaction.wait(6)

    // args represent contract constructor arguments
    const args = [nftContract.address, tokenContract.address]
    await verify(stakingVault.address, args)
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
