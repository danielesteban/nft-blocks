const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    rinkeby: {
      provider: new HDWalletProvider(
        process.env.MNEMONICS,
        `https://rinkeby.infura.io/v3/${process.env.PROJECT_ID}`
      ),
      network_id: 4,
      gas: 5000000,
      gasPrice: 5000000000, // 5 Gwei
      skipDryRun: true,
    },
    ropsten: {
      provider: new HDWalletProvider(
        process.env.MNEMONICS,
        `https://ropsten.infura.io/v3/${process.env.PROJECT_ID}`
      ),
      network_id: 3,
      gas: 5000000,
      gasPrice: 5000000000, // 5 Gwei
      skipDryRun: true,
    },
  },
  mocha: {
    // timeout: 100000
  },
  compilers: {
    solc: {
      version: '0.6.2',
    },
  },
};
