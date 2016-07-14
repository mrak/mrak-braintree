const express = require('express');
const path = require('path');
const braintree = require('./braintree');
const constants = require('./constants');
const app = express();
const staticDir = path.resolve(__dirname, '../public');

app.set('port', constants.port);
app.use(express.static(staticDir));

app.get('/client_token', (req, res) => {
  braintree.clientToken.generate({}, (err, response) => {
    res.send(response.clientToken);
  });
})

app.get('/tokenization_key', (req, res) => {
  res.send(constants.tokenizationKey);
})

module.exports = app;
