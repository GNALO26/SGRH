const { z } = require('zod');
const leaveService = require('../services/leaveService');
const AppDataSource = require('../config/typeorm');
const ActivityLog = require('../entities/ActivityLog');

// Schémas de validation
const createLeaveSchema = z.object({
  employee_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant employé invalide.').optional(),
  leave_type: z.enum(['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other']),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Date de début invalide.'
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Date de fin invalide.'
  }),
  reason: z.string().optional().nullable()
});

const updateLeaveStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'cancelled']),
  rejection_reason: z.string().optional().nullable()
});

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide.')
});

/**
 * POST /api/admin/leaves
 * Crée un congé pour un employé (admin).
 */
async function createLeaveAdmin(req, res, next) {
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const data = createLeaveSchema.parse(req.body);
    const employeeId = data.employee_id || req.body.employee_id;
    if (!employeeId) {
      return res.status(422).json({ message: 'employee_id est requis.' });
    }

    const leave = await leaveService.createLeave(
      {
        leave_type: data.leave_type,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        reason: data.reason
      },
      req.company_id,
      employeeId
    );

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'leave.created_by_admin',
        entity_type: 'Leave',
        entity_id: leave._id,
        metadata: { employee_id: employeeId }
      })
    );

    return res.status(201).json({
      message: 'Congé créé avec succès.',
      leave
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
 * POST /api/employee/leaves
 * Crée un congé pour l'employé connecté.
 */
async function createLeaveEmployee(req, res, next) {
  try {
    const data = createLeaveSchema.parse(req.body);
    const employeeId = req.user._id;

    const leave = await leaveService.createLeave(
      {
        leave_type: data.leave_type,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        reason: data.reason
      },
      req.company_id,
      employeeId
    );

    return res.status(201).json({
      message: 'Demande de congé soumise.',
      leave
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
 * GET /api/admin/leaves
 * Liste tous les congés de l'entreprise (admin).
 */
async function listLeavesAdmin(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = { company_id: req.company_id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.employee_id) filter.employee_id = req.query.employee_id;

    const result = await leaveService.listLeaves(filter, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/employee/leaves
 * Liste les congés de l'employé connecté.
 */
async function listLeavesEmployee(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = { company_id: req.company_id, employee_id: req.user._id };

    if (req.query.status) filter.status = req.query.status;

    const result = await leaveService.listLeaves(filter, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/leaves/:id
 * Met à jour le statut d'un congé.
 */
async function updateLeaveStatusAdmin(req, res, next) {
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateLeaveStatusSchema.parse(req.body);

    const leave = await leaveService.updateLeaveStatus(id, req.company_id, {
      status: data.status,
      rejection_reason: data.rejection_reason,
      approved_by: req.user._id
    });

    if (!leave) {
      return res.status(404).json({ message: 'Congé non trouvé.' });
    }

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: `leave.${data.status}`,
        entity_type: 'Leave',
        entity_id: leave._id,
        metadata: { employee_id: leave.employee_id }
      })
    );

    return res.status(200).json({
      message: `Congé ${data.status === 'approved' ? 'approuvé' : data.status === 'rejected' ? 'rejeté' : 'annulé'}.`,
      leave
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
 * DELETE /api/employee/leaves/:id
 * Supprime une demande de congé en attente.
 */
async function deleteLeaveEmployee(req, res, next) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const leave = await leaveService.deleteLeave(id, req.company_id, req.user._id);

    if (!leave) {
      return res.status(404).json({ message: 'Congé non trouvé ou déjà traité.' });
    }

    return res.status(200).json({ message: 'Demande de congé supprimée.' });
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
  createLeaveAdmin,
  createLeaveEmployee,
  listLeavesAdmin,
  listLeavesEmployee,
  updateLeaveStatusAdmin,
  deleteLeaveEmployee
};