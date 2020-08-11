const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const setupUserEndpoints = require('./endpoints/user');

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

const server = app.listen(process.env.PORT || 8080, () => {
  console.log(`Listening on port: ${server.address().port}`);
});

setupUserEndpoints(app);
app.use((req, res) => res.status(404).end());
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => res.status(500).end());

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/nft-blocks');
