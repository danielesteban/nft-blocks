module.exports = (app) => {
  app.get(
    '/contract',
    (req, res) => {
      res.json({
        name: 'nft-blocks',
        external_link: app.get('client'),
      });
    }
  );
};
