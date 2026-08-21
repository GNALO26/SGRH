const Bull = require('bull');
const config = require('./index');

const createQueue = (name) => {
  return new Bull(name, {
    redis: {
      url: config.redis.url
    }
  });
};

module.exports = { createQueue };