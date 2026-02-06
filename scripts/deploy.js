const hre = require("hardhat");

async function main() {
  console.log("Deploying DatasetMarketplace...");
  console.log("Network:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "0G");

  const DatasetMarketplace = await hre.ethers.getContractFactory(
    "DatasetMarketplace",
  );
  const marketplace = await DatasetMarketplace.deploy();
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("\nDatasetMarketplace deployed to:", address);
  console.log("\nUpdate your .env.local with:");
  console.log(`NEXT_PUBLIC_MARKETPLACE_CONTRACT=${address}`);

  // Wait for a few block confirmations before verification
  console.log("\nWaiting for 5 block confirmations...");
  const deployTx = marketplace.deploymentTransaction();
  await deployTx.wait(5);
  console.log("Confirmed!");

  // Verify the contract
  console.log("\nVerifying contract on explorer...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("already verified")) {
      console.log("Contract is already verified!");
    } else {
      console.error("Verification failed:", error.message);
      console.log("\nYou can manually verify later with:");
      console.log(`npx hardhat verify --network og_testnet ${address}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
