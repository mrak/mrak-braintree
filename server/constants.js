module.exports = {
  port: process.env.PORT || 8080,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  tokenizationKey: process.env.BRAINTREE_TOKENIZATION_KEY,
};
