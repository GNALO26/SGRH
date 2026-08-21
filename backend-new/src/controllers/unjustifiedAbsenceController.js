const { z } = require('zod');
const absenceService = require('../services/absenceService');

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide.')
});

const explainSchema = z.object({
  explanation: z.string().min(10, 'L\'explication doit contenir au moins 10 caractères.')
});

/**
 * GET /api/admin/unjustified-absences
 * Liste les absences non justifiées.
 */
async function listAbsencesAdmin(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = { company_id: req.company_id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.employee_id) filter.employee_id = req.query.employee_id;

    const result = await absenceService.listUnjustifiedAbsences(filter, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/unjustified-absences/:id
 * Détails d'une absence.
 */
async function getAbsenceAdmin(req, res, next) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const absence = await absenceService.getAbsenceById(id, req.company_id);
    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée.' });
    }
    return res.status(200).json({ absence });
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

/**
 * GET /api/employee/unjustified-absences
 * Liste les absences de l'employé connecté.
 */
async function listAbsencesEmployee(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = { company_id: req.company_id, employee_id: req.user._id };

    if (req.query.status) filter.status = req.query.status;

    const result = await absenceService.listUnjustifiedAbsences(filter, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/employee/unjustified-absences/:id/explain
 * Soumet une explication pour une absence.
 */
async function explainAbsenceEmployee(req, res, next) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { explanation } = explainSchema.parse(req.body);

    const absence = await absenceService.explainAbsence(id, req.company_id, req.user._id, explanation);
    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée ou non autorisée.' });
    }

    return res.status(200).json({
      message: 'Explication soumise.',
      absence
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
  listAbsencesAdmin,
  getAbsenceAdmin,
  listAbsencesEmployee,
  explainAbsenceEmployee
};