require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

module.exports = {
  solidity: {
    version: "0.8.30",
    settings: {
      optimizer: {
        enabled: false,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    og_testnet: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://evmrpc-testnet.0g.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 16602,
    },
    og_mainnet: {
      url: "https://evmrpc.0g.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 16661,
    },
  },
  etherscan: {
    apiKey: {
      og_testnet: "abc", // placeholder — 0G explorer doesn't require a real API key
      og_mainnet: "abc",
    },
    customChains: [
      {
        network: "og_testnet",
        chainId: 16602,
        urls: {
          apiURL: "https://chainscan-galileo.0g.ai/open/api",
          browserURL: "https://chainscan-galileo.0g.ai",
        },
      },
      {
        network: "og_mainnet",
        chainId: 16661,
        urls: {
          apiURL: "https://chainscan.0g.ai/open/api",
          browserURL: "https://chainscan.0g.ai",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
