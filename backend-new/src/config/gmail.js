const { google } = require('googleapis');
const config = require('./index');

const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

oauth2Client.setCredentials({
  refresh_token: config.google.refreshToken
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

module.exports = { oauth2Client, gmail };