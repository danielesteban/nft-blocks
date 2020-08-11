import { get, writable } from 'svelte/store';
import BlocksToken from '../artifacts/BlocksToken.json';

const { TruffleContract, Web3 } = window;
const web3 = Web3.givenProvider ? (
  new Web3(Web3.givenProvider)
) : undefined;
if (web3 && web3.currentProvider.autoRefreshOnNetworkChange) {
  web3.currentProvider.autoRefreshOnNetworkChange = false;
}

let contract;
export const status = (() => {
  const { subscribe, set } = writable('unsupported');
  const load = () => {
    contract = undefined;
    set('loading');
    (__NetworkId__ ? (
      web3.eth.net.getId()
        .then((networkId) => {
          if (networkId.toString() !== __NetworkId__) {
            throw new Error('wrongnetwork');
          }
        })
    ) : Promise.resolve())
      .then(() => {
        const artifact = TruffleContract(BlocksToken);
        artifact.setProvider(web3.currentProvider);
        return artifact.at(__TokensAddress__)
          .then((instance) => {
            contract = instance;
            set('ready');
          })
          .catch(() => {
            throw new Error('error');
          });
      })
      .catch(({ message }) => (
        set(message)
      ));
  };
  if (web3) {
    load();
    web3.currentProvider.on('chainChanged', load);
  }
  return {
    subscribe,
  };
})();

export const account = (() => {
  const { subscribe, set } = writable();
  if (web3) {
    web3.currentProvider.on('accountsChanged', (accounts) => (
      set(accounts[0])
    ));
    web3.eth.getAccounts()
      .then((accounts) => (
        set(accounts[0])
      ));
  }
  return {
    subscribe,
    request: () => (
      web3 && web3.currentProvider.request({ method: 'eth_requestAccounts' })
    ),
  };
})();

export const hashes = (() => {
  const { subscribe, update } = writable({});
  return {
    subscribe,
    fetch: (tokenId) => {
      if (!contract) {
        return Promise.reject();
      }
      return contract.hash(tokenId)
        .then((hash) => (
          update((state) => ({
            ...state,
            [tokenId]: hash,
          }))
        ));
    },
  };
})();

export const mint = (gltf) => {
  const $account = get(account);
  if (!contract || !$account) {
    return Promise.reject();
  }
  const body = new FormData();
  body.append('gltf', gltf);
  return fetch(`${__API__}upload`, {
    body,
    method: 'POST',
  })
    .then((res) => {
      if (res.status !== 200) {
        throw new Error();
      }
      return res.json();
    })
    .then((hash) => (
      contract.mint(hash, { from: $account, value: web3.utils.toWei('0.005', 'ether') })
        .then(({ logs: [{ args: { tokenId } }] }) => (
          tokenId.toString()
        ))
    ));
};
