const { z } = require('zod');
const AppDataSource = require('../config/typeorm');
const Company = require('../entities/Company');
const { absenceQueue } = require('../services/queueService');

// Schéma de validation de l'API key
const apiKeySchema = z.object({
  api_key: z.string().min(1, 'Clé API requise.')
});

/**
 * POST /api/internal/trigger-absences
 * Endpoint interne protégé par une clé API pour déclencher la détection des absences.
 * Body attendu : { api_key: "..." }
 */
async function triggerAbsences(req, res, next) {
  const companyRepository = AppDataSource.getRepository(Company);
  try {
    const { api_key } = apiKeySchema.parse(req.body);

    if (api_key !== process.env.INTERNAL_API_KEY) {
      return res.status(403).json({ message: 'Clé API invalide.' });
    }

    // Récupérer toutes les entreprises actives
    const companies = await companyRepository.find({ where: { is_active: true } });

    // Ajouter un job pour chaque entreprise
    for (const company of companies) {
      await absenceQueue.add({
        companyId: company._id,
        targetDate: new Date()
      });
    }

    return res.status(200).json({
      message: `Détection des absences déclenchée pour ${companies.length} entreprise(s).`
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

module.exports = {
  triggerAbsences
};