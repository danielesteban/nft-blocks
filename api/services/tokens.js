const Web3 = require('web3');
const TruffleContract = require('truffle-contract');
const BlocksToken = require('../artifacts/BlocksToken.json');

const web3 = new Web3(new Web3.providers.HttpProvider(
  process.env.WEB3_PROVIDER || 'http://localhost:8545/'
));

let contract;
const artifact = TruffleContract(BlocksToken);
artifact.setProvider(web3.currentProvider);
artifact.at(process.env.TOKENS_ADDRESS)
  .then((instance) => {
    console.log('loaded tokens contract');
    contract = instance;
  })
  .catch((e) => console.error('error loading tokens contract', e.message));

module.exports = {
  creator(tokenId) {
    if (!contract) {
      return Promise.reject();
    }
    return contract.getPastEvents('Transfer', {
      filter: {
        tokenId,
        from: '0x0000000000000000000000000000000000000000',
      },
      fromBlock: 0,
      toBlock: 'latest',
    }).then(([event]) => {
      if (!event) {
        throw new Error();
      }
      return event.returnValues.to;
    });
  },
  list(account) {
    if (!contract) {
      return Promise.reject();
    }
    return (account ? (
      contract.balanceOf(account)
    ) : (
      contract.totalSupply()
    ))
      .then((count) => Promise.all(
        [...Array(count.toNumber())].map((v, i) => (
          account ? (
            contract.tokenOfOwnerByIndex(account, count - 1 - i)
          ) : (
            contract.tokenByIndex(count - 1 - i)
          )
        ))
      ))
      .then((tokens) => tokens.map((tokenId) => tokenId.toString()));
  },
  hash(tokenId) {
    if (!contract) {
      return Promise.reject();
    }
    return contract.hash(tokenId);
  },
  owner(tokenId) {
    if (!contract) {
      return Promise.reject();
    }
    return contract.ownerOf(tokenId).then((tokenId) => tokenId.toString());
  },
};
