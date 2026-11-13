const hre = require("hardhat");

// Deploy:
//   Lokal (MockUSD8 + AevumPay):
//     npx hardhat run scripts/deploy.js
//   Aevum Testnet dengan token resmi tUSD8:
//     TOKEN_ADDRESS=<alamat tUSD8 resmi> npx hardhat run scripts/deploy.js --network aevum
//   Aevum Testnet dengan MockUSD8 (HANYA untuk uji deploy, bukan submission):
//     USE_MOCK=true npx hardhat run scripts/deploy.js --network aevum
async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const useMock = process.env.USE_MOCK === "true" || !tokenAddress;

  let token;
  if (useMock) {
    console.log("Deploy MockUSD8 (token tiruan, HANYA untuk dev/uji) ...");
    const Mock = await hre.ethers.getContractFactory("MockUSD8");
    token = await Mock.deploy();
    await token.waitForDeployment();
    console.log("MockUSD8:", await token.getAddress());
  } else {
    console.log("Pakai token resmi:", tokenAddress);
  }

  const tokenAddr = useMock ? await token.getAddress() : tokenAddress;
  const Pay = await hre.ethers.getContractFactory("AevumPay");
  const pay = await Pay.deploy(tokenAddr);
  await pay.waitForDeployment();
  console.log("AevumPay:", await pay.getAddress());
  console.log("Token:", tokenAddr);
  console.log("Network:", hre.network.name, "| chainId:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("Cek di explorer: https://explorer-test.qday.info/address/" + (await pay.getAddress()));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
