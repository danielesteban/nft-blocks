const ipfsHttp = require('ipfs-http-client');
const all = require('it-all');

let node;
(() => {
  const ipfs = ipfsHttp(process.env.IPFS_HOST || 'http://localhost:5002/');
  return ipfs
    .id()
    .then(() => ipfs);
})()
  .then((ipfs) => {
    console.log('connected to IPFS node');
    node = ipfs;
  })
  .catch((e) => console.error('error connecting to IPFS node', e.message));

module.exports = {
  add(buffer) {
    if (!node) {
      return Promise.reject();
    }
    return node
      .add({ content: buffer })
      .then(({ path }) => (path));
  },
  get(cid) {
    if (!node) {
      return Promise.reject();
    }
    return all(node.cat(cid)).then((buffers) => Buffer.concat(buffers));
  },
};
