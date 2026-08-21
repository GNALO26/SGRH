const cloudinary = require('cloudinary').v2;
const config = require('./index');

if (config.cloudinary.url) {
  const parsed = new URL(config.cloudinary.url);
  const apiKey = parsed.username;
  const apiSecret = parsed.password;
  const cloudName = parsed.host;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

module.exports = cloudinary;