const rateLimit = require('express-rate-limit');

/**
 * Limiteur global pour toutes les routes /api.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, veuillez réessayer plus tard.' }
});

/**
 * Limiteur strict pour les routes d'authentification.
 */
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.' }
});

module.exports = { globalLimiter, authLimiter };