const path = require('path');
const admin = require('firebase-admin');
const config = require('./index');

if (!admin.apps.length) {
  const credentialsPath = config.firebase.credentialsPath;

  if (credentialsPath) {
    const serviceAccount = require(path.resolve(process.cwd(), credentialsPath));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp({
      projectId: config.firebase.projectId
    });
  }
}

module.exports = admin;