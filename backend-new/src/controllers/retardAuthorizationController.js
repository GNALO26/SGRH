const { z } = require('zod');
const retardAuthorizationService = require('../services/retardAuthorizationService');
const AppDataSource = require('../config/typeorm');
const ActivityLog = require('../entities/ActivityLog');

const createRetardSchema = z.object({
  employee_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant employé invalide.').optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Date invalide.'
  }),
  reason: z.string().min(5, 'La raison doit contenir au moins 5 caractères.')
});

const updateRetardStatusSchema = z.object({
  status: z.enum(['approved', 'rejected'])
});

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide.')
});

/**
 * POST /api/admin/retard-authorizations
 * Crée une autorisation pour un employé.
 */
async function createRetardAdmin(req, res, next) {
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const data = createRetardSchema.parse(req.body);
    const employeeId = data.employee_id || req.body.employee_id;
    if (!employeeId) {
      return res.status(422).json({ message: 'employee_id est requis.' });
    }

    const authorization = await retardAuthorizationService.createRetardAuthorization(
      { date: new Date(data.date), reason: data.reason },
      req.company_id,
      employeeId
    );

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'retard_authorization.created_by_admin',
        entity_type: 'RetardAuthorization',
        entity_id: authorization._id,
        metadata: { employee_id: employeeId }
      })
    );

    return res.status(201).json({
      message: 'Autorisation créée.',
      authorization
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

/**
 * POST /api/employee/retard-authorizations
 * Crée une demande d'autorisation pour l'employé connecté.
 */
async function createRetardEmployee(req, res, next) {
  try {
    const data = createRetardSchema.parse(req.body);

    const authorization = await retardAuthorizationService.createRetardAuthorization(
      { date: new Date(data.date), reason: data.reason },
      req.company_id,
      req.user._id
    );

    return res.status(201).json({
      message: 'Demande d\'autorisation soumise.',
      authorization
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

/**
 * GET /api/admin/retard-authorizations
 * Liste toutes les autorisations.
 */
async function listRetardAdmin(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = { company_id: req.company_id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.employee_id) filter.employee_id = req.query.employee_id;

    const result = await retardAuthorizationService.listRetardAuthorizations(filter, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/employee/retard-authorizations
 * Liste les demandes de l'employé.
 */
async function listRetardEmployee(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = { company_id: req.company_id, employee_id: req.user._id };

    if (req.query.status) filter.status = req.query.status;

    const result = await retardAuthorizationService.listRetardAuthorizations(filter, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/retard-authorizations/:id
 * Approuve ou rejette une autorisation.
 */
async function updateRetardStatusAdmin(req, res, next) {
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const { id } = idParamSchema.parse(req.params);
    const { status } = updateRetardStatusSchema.parse(req.body);

    const authorization = await retardAuthorizationService.updateRetardAuthorizationStatus(id, req.company_id, {
      status,
      approved_by: req.user._id
    });

    if (!authorization) {
      return res.status(404).json({ message: 'Autorisation non trouvée.' });
    }

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: `retard_authorization.${status}`,
        entity_type: 'RetardAuthorization',
        entity_id: authorization._id,
        metadata: { employee_id: authorization.employee_id }
      })
    );

    return res.status(200).json({
      message: `Autorisation ${status === 'approved' ? 'approuvée' : 'rejetée'}.`,
      authorization
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

/**
 * DELETE /api/employee/retard-authorizations/:id
 * Supprime une demande en attente.
 */
async function deleteRetardEmployee(req, res, next) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const authorization = await retardAuthorizationService.deleteRetardAuthorization(id, req.company_id, req.user._id);

    if (!authorization) {
      return res.status(404).json({ message: 'Autorisation non trouvée ou déjà traitée.' });
    }

    return res.status(200).json({ message: 'Demande supprimée.' });
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
  createRetardAdmin,
  createRetardEmployee,
  listRetardAdmin,
  listRetardEmployee,
  updateRetardStatusAdmin,
  deleteRetardEmployee
};