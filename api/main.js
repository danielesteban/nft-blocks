require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const setupTokenEndpoints = require('./endpoints/token');

const client = process.env.CLIENT || 'http://localhost:8080/';
const origin = (() => {
  let origin = new URL(client);
  origin.pathname = '/';
  origin = origin.toString();
  return origin.substr(0, origin.length - 1);
})();

const app = express();
app.set('client', client);
app.use(helmet());
app.use(cors({ origin }));
app.use(bodyParser.json());

const server = app.listen(process.env.PORT || 8081, () => {
  console.log(`Listening on port: ${server.address().port}`);
});

setupTokenEndpoints(app);
app.use((req, res) => res.status(404).end());
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => res.status(500).end());
