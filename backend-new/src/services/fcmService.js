const admin = require('../config/firebase');

/**
 * Envoie une notification push via Firebase Cloud Messaging.
 * @param {string} fcmToken - Token FCM du destinataire.
 * @param {Object} payload - Données de la notification.
 * @param {string} payload.title - Titre.
 * @param {string} payload.body - Corps du message.
 * @param {Object} [payload.data] - Données additionnelles.
 * @returns {Promise<void>}
 */
async function sendPushNotification(fcmToken, payload) {
  if (!fcmToken) return;

  const message = {
    token: fcmToken,
    notification: {
      title: payload.title,
      body: payload.body,
      sound: 'notification.mp3'
    },
    data: payload.data ? {
      ...payload.data,
      sound: 'notification.mp3'
    } : undefined
  };

  try {
    await admin.messaging().send(message);
  } catch (error) {
    console.error('Erreur FCM:', error);
    // On ne bloque pas l'application si l'envoi push échoue
  }
}

module.exports = { sendPushNotification };