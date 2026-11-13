require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    // Aevum Testnet — QDay. Chain ID 44005, RPC https://rpc-test.qday.info
    // Explorer (Blockscout): https://explorer-test.qday.info
    aevum: {
      url: process.env.AEVUM_RPC_URL || "https://rpc-test.qday.info",
      chainId: 44005,
      // JANGAN commit private key. Isi .env (lihat .env.example).
      // Key ini HANYA untuk wallet testnet (tQDAY, tanpa nilai).
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
  etherscan: {
    // Blockscout — verifikasi via `npx hardhat verify --network aevum <addr> <args>`
    apiKey: { aevum: "abc" },
    customChains: [
      {
        network: "aevum",
        chainId: 44005,
        urls: {
          apiURL: "https://explorer-test.qday.info/api",
          browserURL: "https://explorer-test.qday.info",
        },
      },
    ],
  },
};
