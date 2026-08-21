const config = require('./index');

const environment = config.fedapay.environment;
const baseUrl = environment === 'live'
  ? 'https://api.fedapay.com/v1'
  : 'https://sandbox-api.fedapay.com/v1';

module.exports = {
  baseUrl,
  publicKey: config.fedapay.publicKey,
  secretKey: config.fedapay.secretKey,
  environment
};