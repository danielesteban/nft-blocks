const fs = require('fs');
const path = require('path');

const BlocksToken = artifacts.require('BlocksToken');

const baseURI = process.env.BASE_URI || 'http://localhost:8081/token/';
const contractURI = process.env.CONTRACT_URI || 'http://localhost:8081/contract';
const mintingCost = process.env.MINTING_COST || '0';

module.exports = async (deployer) => {
  await deployer.deploy(
    BlocksToken,
    'nft-blocks',
    'BLOCKS',
    baseURI,
    contractURI,
    mintingCost
  );
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  [
    path.join(__dirname, '..', 'api', '.env'),
    path.join(__dirname, '..', 'client', '.env'),
  ].forEach((envPath) => {
    let env;
    try {
      env = fs.readFileSync(envPath, 'utf8')
        .split('\n')
        .filter((line) => (
          line
          && line.indexOf('NETWORK_ID=') !== 0
          && line.indexOf('TOKENS_ADDRESS=') !== 0
        ));
    } catch (e) {
      env = [];
    }
    env.push(`NETWORK_ID=${BlocksToken.network_id}`);
    env.push(`TOKENS_ADDRESS=${BlocksToken.address}`);
    fs.writeFileSync(envPath, env.join('\n'));
  });
};
