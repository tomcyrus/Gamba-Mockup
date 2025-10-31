const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy GambaBetting contract
  const platformWallet = process.env.PLATFORM_WALLET || deployer.address;
  
  const GambaBetting = await hre.ethers.getContractFactory("GambaBetting");
  const gambaBetting = await GambaBetting.deploy(platformWallet);
  await gambaBetting.waitForDeployment();

  const bettingAddress = await gambaBetting.getAddress();
  console.log("GambaBetting deployed to:", bettingAddress);

  // Deploy test token (USDC-like token for testing)
  const GambaToken = await hre.ethers.getContractFactory("GambaToken");
  const usdc = await GambaToken.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();

  const usdcAddress = await usdc.getAddress();
  console.log("Test USDC deployed to:", usdcAddress);

  // Add initial liquidity for native token (ETH/BNB)
  const initialLiquidity = hre.ethers.parseEther("1.0");
  const addLiquidityTx = await gambaBetting.addLiquidity(hre.ethers.ZeroAddress, initialLiquidity, {
    value: initialLiquidity,
  });
  await addLiquidityTx.wait();
  console.log("Added", hre.ethers.formatEther(initialLiquidity), "of native token liquidity");

  // Add USDC as supported token
  const addTokenTx = await gambaBetting.addSupportedToken(
    usdcAddress,
    hre.ethers.parseUnits("10000", 6), // Max payout: 10,000 USDC
    hre.ethers.parseUnits("1", 6), // Min wager: 1 USDC
    200 // House edge: 2%
  );
  await addTokenTx.wait();
  console.log("USDC added as supported token");

  // Mint some test USDC to deployer
  const mintTx = await usdc.mint(deployer.address, hre.ethers.parseUnits("10000", 6));
  await mintTx.wait();
  console.log("Minted 10,000 test USDC to deployer");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    contracts: {
      GambaBetting: bettingAddress,
      USDC: usdcAddress,
    },
    deployer: deployer.address,
    platformWallet: platformWallet,
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\nDeployment info saved to: deployments/${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
