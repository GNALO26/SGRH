const jwt = require('jsonwebtoken');
const config = require('../config');
const AppDataSource = require('../config/typeorm');
const User = require('../entities/User');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { _id: decoded.sub } });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Compte désactivé.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide.' });
    }
    return res.status(500).json({ message: 'Erreur lors de l\'authentification.' });
  }
};