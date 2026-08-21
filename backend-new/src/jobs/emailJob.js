const { emailQueue } = require('../services/queueService');
const emailService = require('../services/emailService');

// Traitement de la file d'attente des emails
emailQueue.process(async (job) => {
  const { to, subject, html } = job.data;
  await emailService.sendEmail(to, subject, html);
});

module.exports = emailQueue;