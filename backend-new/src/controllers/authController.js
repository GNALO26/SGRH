const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const AppDataSource = require('../config/typeorm');
const User = require('../entities/User');
const config = require('../config');
const { sendEmail, generateTwoFactorEmail } = require('../services/emailService');
const { absenceQueue } = require('../services/queueService');

const loginSchema = z.object({
  email: z.string().email('Email invalide.'),
  password: z.string().min(1, 'Le mot de passe est requis.')
});

const verify2faSchema = z.object({
  temp_token: z.string().min(1, 'Token temporaire requis.'),
  code: z.string().length(6, 'Le code doit contenir 6 chiffres.')
});

const resend2faSchema = z.object({
  temp_token: z.string().min(1, 'Token temporaire requis.')
});

const fcmTokenSchema = z.object({
  fcm_token: z.string().min(1, 'Token FCM requis.')
});

const avatarSchema = z.object({
  avatar_url: z.string().min(1, 'URL de l\'avatar requise.')
});

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), type: 'access' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function generateTempToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), type: '2fa' },
    config.jwt.secret,
    { expiresIn: '10m' }
  );
}

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Compte désactivé.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.two_factor_code = code;
    user.two_factor_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await userRepository.save(user);

    await sendEmail(
      user.email,
      'Code de vérification NaoHR',
      generateTwoFactorEmail(code)
    );

    user.last_login_at = new Date();
    await userRepository.save(user);

    const tempToken = generateTempToken(user);

    return res.status(200).json({
      message: 'Code de vérification envoyé.',
      temp_token: tempToken,
      two_factor_required: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Erreur de validation.',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
}

async function verify2fa(req, res, next) {
  try {
    const { temp_token, code } = verify2faSchema.parse(req.body);

    let decoded;
    try {
      decoded = jwt.verify(temp_token, config.jwt.secret);
    } catch (err) {
      return res.status(401).json({ message: 'Token temporaire invalide ou expiré.' });
    }

    if (decoded.type !== '2fa') {
      return res.status(401).json({ message: 'Token temporaire invalide.' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { _id: decoded.sub } });
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }

    if (!user.two_factor_code || !user.two_factor_expires_at) {
      return res.status(400).json({ message: 'Aucun code 2FA actif.' });
    }

    if (new Date() > user.two_factor_expires_at) {
      return res.status(400).json({ message: 'Code expiré. Veuillez renvoyer un nouveau code.' });
    }

    if (user.two_factor_code !== code) {
      return res.status(400).json({ message: 'Code incorrect.' });
    }

    user.two_factor_code = null;
    user.two_factor_expires_at = null;
    await userRepository.save(user);

    const accessToken = generateAccessToken(user);

    if (user.role === 'employee') {
      absenceQueue.add({
        companyId: user.company_id,
        employeeId: user._id,
        targetDate: new Date()
      }).catch(err => console.error('Erreur ajout job détection absence:', err));
    }

    return res.status(200).json({
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Erreur de validation.',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
}

async function resend2fa(req, res, next) {
  try {
    const { temp_token } = resend2faSchema.parse(req.body);

    let decoded;
    try {
      decoded = jwt.verify(temp_token, config.jwt.secret);
    } catch (err) {
      return res.status(401).json({ message: 'Token temporaire invalide ou expiré.' });
    }

    if (decoded.type !== '2fa') {
      return res.status(401).json({ message: 'Token temporaire invalide.' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { _id: decoded.sub } });
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.two_factor_code = code;
    user.two_factor_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await userRepository.save(user);

    await sendEmail(
      user.email,
      'Nouveau code de vérification NaoHR',
      generateTwoFactorEmail(code)
    );

    return res.status(200).json({ message: 'Nouveau code envoyé.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Erreur de validation.',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = req.user;
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        matricule: user.matricule,
        position: user.position,
        department: user.department,
        avatar_url: user.avatar_url,
        company_id: user.company_id
      }
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    return res.status(200).json({ message: 'Déconnexion réussie.' });
  } catch (error) {
    next(error);
  }
}

async function updateAvatar(req, res, next) {
  try {
    const { avatar_url } = avatarSchema.parse(req.body);
    const userRepository = AppDataSource.getRepository(User);
    const user = req.user;

    user.avatar_url = avatar_url;
    await userRepository.save(user);

    return res.status(200).json({ message: 'Avatar mis à jour.', avatar_url: user.avatar_url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Erreur de validation.',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
}

async function updateFcmToken(req, res, next) {
  try {
    const { fcm_token } = fcmTokenSchema.parse(req.body);
    const userRepository = AppDataSource.getRepository(User);
    const user = req.user;

    user.fcm_token = fcm_token;
    await userRepository.save(user);

    return res.status(200).json({ message: 'Token FCM enregistré.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Erreur de validation.',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
}

module.exports = {
  login,
  verify2fa,
  resend2fa,
  me,
  logout,
  updateAvatar,
  updateFcmToken
};