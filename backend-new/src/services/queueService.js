const Bull = require('bull');
const config = require('../config');

// Files d'attente
const emailQueue = new Bull('email', {
  redis: { url: config.redis.url }
});

const notificationQueue = new Bull('notification', {
  redis: { url: config.redis.url }
});

const absenceQueue = new Bull('absence-detection', {
  redis: { url: config.redis.url }
});

module.exports = {
  emailQueue,
  notificationQueue,
  absenceQueue
};