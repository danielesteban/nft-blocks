const ipfsHttp = require('ipfs-http-client');

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
  addFile(buffer) {
    if (!node) {
      return Promise.reject();
    }
    return node
      .add({ content: buffer })
      .then(({ path }) => (path));
  },
};
