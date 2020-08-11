const IPFS = require('ipfs');

let node;
IPFS.create()
  .then((instance) => {
    node = instance;
  })
  .catch(() => {});

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
