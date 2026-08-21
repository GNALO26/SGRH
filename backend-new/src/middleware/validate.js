const { ZodError } = require('zod');

/**
 * Middleware de validation Zod.
 * Accepte un objet avec les clés `body`, `query`, `params`.
 * Chaque clé correspond à un schéma Zod.
 */
const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(422).json({
          message: 'Erreur de validation.',
          errors
        });
      }
      next(error);
    }
  };
};

module.exports = validate;