const { param, validationResult } = require('express-validator');
const multer = require('multer');
const ipfs = require('../services/ipfs');
const tokens = require('../services/tokens');

module.exports = (app) => {
  const upload = multer({
    limits: { fileSize: 1048576 },
    storage: multer.memoryStorage(),
  });

  app.get(
    '/tokens',
    (req, res) => {
      tokens
        .list()
        .then((tokens) => (
          res.json(tokens)
        ))
        .catch(() => res.status(500).end());
    }
  );

  app.get(
    '/token/:id',
    param('id')
      .isInt()
      .toInt(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        res.status(422).end();
        return;
      }
      const { id } = req.params;
      tokens
        .hash(id)
        .then((hash) => (
          res.json({
            name: `Blocks #${id}`,
            hash,
            external_url: `${app.get('client')}#/token/${id}`,
          })
        ))
        .catch(() => res.status(404).end());
    }
  );

  app.post(
    '/upload',
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
