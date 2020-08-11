const multer = require('multer');
const User = require('../models/user');
const ipfs = require('../services/ipfs');

module.exports = (app) => {
  const upload = multer({
    limits: { fileSize: 1048576 },
    storage: multer.memoryStorage(),
  });

  app.post(
    '/upload',
    // User.authenticate,
    upload.single('gltf'),
    (req, res) => {
      if (
        !req.file
        || req.file.mimetype !== 'model/gltf-binary'
      ) {
        res.status(422).end();
        return;
      }
      const gltf = req.file.buffer;
      ipfs
        .addFile(Buffer.from(gltf))
        .then((hash) => (
          res.json(hash)
        ))
        .catch(() => res.status(500).end());
    }
  );
};
