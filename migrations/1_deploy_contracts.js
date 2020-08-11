const fs = require('fs');
const path = require('path');

const BlocksToken = artifacts.require('BlocksToken');

module.exports = async (deployer) => {
  await deployer.deploy(BlocksToken, process.env.BASE_URI || 'http://localhost:8080/');
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
        && line.indexOf('CONTRACT_ADDRESS=') !== 0
      ));
  } catch (e) {
    env = [];
  }
  env.push(`CONTRACT_ADDRESS=${BlocksToken.address}`);
  fs.writeFileSync(envPath, env.join('\n'));
};
