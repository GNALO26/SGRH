const { ZodError } = require('zod');
const { TypeORMError, QueryFailedError } = require('typeorm');

const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  if (err instanceof ZodError) {
    return res.status(422).json({
      message: 'Erreur de validation.',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Erreurs TypeORM
  if (err instanceof QueryFailedError) {
    // Gestion de la duplication
    if (err.message.includes('duplicate key')) {
      return res.status(409).json({ message: 'Un enregistrement avec ces données existe déjà.' });
    }
    return res.status(400).json({ message: 'Erreur de base de données.' });
  }

  if (err instanceof TypeORMError) {
    return res.status(400).json({ message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur.';
  res.status(statusCode).json({ message });
};

module.exports = errorHandler;