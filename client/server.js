const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const server = app.listen(process.env.PORT || 8080, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port: ${server.address().port}`);
});

let index;
const indexPath = path.join(__dirname, 'index.html');
const loadIndex = () => {
  index = fs.readFileSync(indexPath, 'utf-8');
};
if (process.env.NODE_ENV !== 'production') {
  fs.watchFile(indexPath, loadIndex);
}
loadIndex();

const API = process.env.API || 'http://localhost:8081/';
app.get('/token/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  let html = index;
  if (!Number.isNaN(id)) {
    html = html.replace('<meta property="og:image" content="https://nftblocks.gatunes.com/screenshot.png" />', [
      `<meta property="og:title" content="Blocks #${(`000000${id}`).slice(-6)}" />`,
      `    <meta property="og:image" content="${API}token/${id}/image" />`,
    ].join('\n'));
  }
  res.type('text/html').send(html);
});

app.use('/index.css', express.static(path.join(__dirname, 'index.css')));
app.use('/screenshot.png', express.static(path.join(__dirname, 'screenshot.png')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use((req, res) => res.type('text/html').send(index));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => res.status(500).end());
