const fs = require('fs');
const path = require('path');

const BlocksToken = artifacts.require('BlocksToken');

const baseURI = process.env.BASE_URI || 'http://localhost:8081/token/';
const mintingCost = process.env.MINTING_COST || '0';

module.exports = async (deployer) => {
  await deployer.deploy(BlocksToken, baseURI, mintingCost);
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  const envPath = path.join(__dirname, '..', '.env');
  let env;
  try {
    env = fs.readFileSync(envPath, 'utf8')
      .split('\n')
      .filter((line) => (
        line
        && line.indexOf('TOKENS_ADDRESS=') !== 0
      ));
  } catch (e) {
    env = [];
  }
  env.push(`TOKENS_ADDRESS=${BlocksToken.address}`);
  fs.writeFileSync(envPath, env.join('\n'));
};
