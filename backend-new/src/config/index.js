require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/naohr'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  redis: {
    url: process.env.REDIS_URL
  },
  cloudinary: {
    url: process.env.CLOUDINARY_URL
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  firebase: {
    projectId: process.env.FCM_PROJECT_ID,
    credentialsPath: process.env.FIREBASE_CREDENTIALS
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    userEmail: process.env.GOOGLE_USER_EMAIL,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
  },
  fedapay: {
    publicKey: process.env.FEDAPAY_PUBLIC_KEY,
    secretKey: process.env.FEDAPAY_SECRET_KEY,
    environment: process.env.FEDAPAY_ENVIRONMENT || 'live'
  }
};

module.exports = config;