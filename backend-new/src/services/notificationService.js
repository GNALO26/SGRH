const AppDataSource = require('../config/typeorm');
const Notification = require('../entities/Notification');
const User = require('../entities/User');
const { sendPushNotification } = require('./fcmService');
const { sendEmail } = require('./emailService');

/**
 * Crée une notification et envoie les canaux appropriés.
 */
async function createNotification({
  companyId,
  recipientId,
  title,
  body,
  type = 'system',
  data = null,
  sendPush = true,
  sendEmail = false
}) {
  const notificationRepository = AppDataSource.getRepository(Notification);
  const userRepository = AppDataSource.getRepository(User);

  const notification = notificationRepository.create({
    company_id: companyId,
    recipient_id: recipientId,
    title,
    body,
    type,
    data,
    is_read: false,
    read_at: null
  });
  await notificationRepository.save(notification);

  if (sendPush) {
    const recipient = await userRepository.findOne({ where: { _id: recipientId } });
    if (recipient && recipient.fcm_token) {
      await sendPushNotification(recipient.fcm_token, { title, body, data });
    }
  }

  if (sendEmail) {
    const recipient = await userRepository.findOne({ where: { _id: recipientId } });
    if (recipient && recipient.email) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>${title}</h2>
          <p>${body}</p>
        </div>
      `;
      await sendEmail(recipient.email, title, html);
    }
  }

  return notification;
}

/**
 * Liste les notifications d'un utilisateur.
 */
async function listNotifications(companyId, recipientId, page = 1, limit = 20) {
  const notificationRepository = AppDataSource.getRepository(Notification);
  const skip = (page - 1) * limit;

  const filter = {
    company_id: companyId,
    recipient_id: recipientId
  };

  const [notifications, total] = await Promise.all([
    notificationRepository.find({
      where: filter,
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    }),
    notificationRepository.count({ where: filter })
  ]);

  return {
    data: notifications,
    meta: {
      current_page: page,
      last_page: Math.ceil(total / limit),
      total,
      per_page: limit
    }
  };
}

/**
 * Marque des notifications comme lues.
 */
async function markNotificationsAsRead(companyId, recipientId, notificationIds) {
  const notificationRepository = AppDataSource.getRepository(Notification);
  const result = await notificationRepository.update(
    {
      _id: { $in: notificationIds },
      company_id: companyId,
      recipient_id: recipientId,
      is_read: false
    },
    { is_read: true, read_at: new Date() }
  );
  return result.affected;
}

module.exports = {
  createNotification,
  listNotifications,
  markNotificationsAsRead
};