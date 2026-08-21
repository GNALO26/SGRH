const { gmail } = require('../config/gmail');
const config = require('../config');

/**
 * Envoie un email via l'API Gmail en utilisant OAuth2.
 * @param {string} to - Adresse email du destinataire.
 * @param {string} subject - Sujet de l'email.
 * @param {string} html - Contenu HTML du message.
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, html) {
  try {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: ${config.google.userEmail}`,
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      html
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Impossible d\'envoyer l\'email.');
  }
}

/**
 * Génère le contenu HTML pour l'email de code 2FA.
 * @param {string} code - Code de vérification.
 * @returns {string} HTML.
 */
function generateTwoFactorEmail(code) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Vérification en deux étapes</h2>
      <p>Votre code de vérification est :</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</p>
      <p>Ce code expire dans 10 minutes.</p>
    </div>
  `;
}

module.exports = { sendEmail, generateTwoFactorEmail };