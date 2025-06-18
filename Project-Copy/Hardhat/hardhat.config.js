require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",   // 👈 explicitly say where your .sol files are
    artifacts: "./artifacts",
    cache: "./cache"
  },
  networks: {
    hardhat: {
      chainId: 1337,
    }
  }
};
