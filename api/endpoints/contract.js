module.exports = (app) => {
  app.get(
    '/contract',
    (req, res) => {
      res.json({
        name: 'nft-blocks',
        description: 'A tool to create virtual tradeable destinations',
        external_link: app.get('client'),
      });
    }
  );
};
