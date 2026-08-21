const { notificationQueue } = require('../services/queueService');
const { sendPushNotification } = require('../services/fcmService');

// Traitement de la file d'attente des notifications push
notificationQueue.process(async (job) => {
  const { fcmToken, title, body, data } = job.data;
  await sendPushNotification(fcmToken, { title, body, data });
});

module.exports = notificationQueue;