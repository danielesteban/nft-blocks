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

export const creators = (() => {
  const { subscribe, update } = writable({});
  return {
    subscribe,
    fetch: (tokenId) => (
      (contract ? (
        contract.getPastEvents('Transfer', {
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
        })
      ) : (
        fetch(`${__API__}token/${tokenId}/creator`)
          .then((res) => {
            if (res.status !== 200) {
              throw new Error();
            }
            return res.json();
          })
      ))
        .then((creator) => (
          update((state) => ({
            ...state,
            [tokenId]: creator,
          }))
        ))
    ),
  };
})();

export const hashes = (() => {
  const { subscribe, update } = writable({});
  return {
    subscribe,
    fetch: (tokenId) => (
      (contract ? (
        contract.hash(tokenId)
      ) : (
        fetch(`${__API__}token/${tokenId}`)
          .then((res) => {
            if (res.status !== 200) {
              throw new Error();
            }
            return res.json();
          })
          .then(({ hash }) => hash)
      ))
        .then((hash) => (
          update((state) => ({
            ...state,
            [tokenId]: hash,
          }))
        ))
    ),
  };
})();

export const list = (() => {
  const { subscribe, set } = writable();
  return {
    subscribe,
    fetch: (account) => {
      set();
      return (contract ? (
        (account ? (
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
          .then((list) => list.map((tokenId) => tokenId.toString()))
      ) : (
        fetch(`${__API__}tokens`)
          .then((res) => {
            if (res.status !== 200) {
              throw new Error();
            }
            return res.json();
          })
      ))
        .then((list) => (
          set(list)
        ));
    },
    reset() {
      set();
    },
  };
})();

export const owners = (() => {
  const { subscribe, update } = writable({});
  return {
    subscribe,
    fetch: (tokenId) => (
      (contract ? (
        contract.ownerOf(tokenId)
      ) : (
        fetch(`${__API__}token/${tokenId}/owner`)
          .then((res) => {
            if (res.status !== 200) {
              throw new Error();
            }
            return res.json();
          })
      ))
        .then((owner) => (
          update((state) => ({
            ...state,
            [tokenId]: owner,
          }))
        ))
    ),
  };
})();

export const isMinting = writable(false);

export const mint = (gltf) => {
  if (!contract) {
    return Promise.reject();
  }
  const $account = get(account);
  return ($account ? (
    Promise.resolve($account)
  ) : (
    account.request().then(([account]) => account)
  ))
    .then((account) => {
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
        .then((hash) => {
          fetch(`${__IPFS__}${hash}`).catch(() => {});
          return contract
            .mintingCost()
            .then((value) => {
              isMinting.set(true);
              return contract.mint(hash, { from: account, value })
                .then(({ logs: [{ args: { tokenId } }] }) => {
                  list.reset();
                  return tokenId.toString();
                })
                .finally(() => isMinting.set(false));
            });
        });
    });
};
