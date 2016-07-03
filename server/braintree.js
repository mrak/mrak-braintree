const constants = require('./constants');
const braintree = require('braintree');

module.exports = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: constants.merchantId,
  publicKey: constants.publicKey,
  privateKey: constants.privateKey,
});
