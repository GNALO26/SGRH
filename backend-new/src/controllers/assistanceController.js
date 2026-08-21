const { z } = require('zod');
const AppDataSource = require('../config/typeorm');
const AssistanceRequest = require('../entities/AssistanceRequest');
const ActivityLog = require('../entities/ActivityLog');
const notificationService = require('../services/notificationService');

const createAssistanceSchema = z.object({
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères.'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères.')
});

const respondAssistanceSchema = z.object({
  response: z.string().min(5, 'La réponse doit contenir au moins 5 caractères.'),
  status: z.enum(['in_progress', 'resolved', 'closed']).optional()
});

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide.')
});

/**
 * POST /api/employee/assistance
 * Crée une demande d'assistance.
 */
async function createAssistance(req, res, next) {
  const assistanceRepository = AppDataSource.getRepository(AssistanceRequest);
  try {
    const { subject, description } = createAssistanceSchema.parse(req.body);

    const assistance = assistanceRepository.create({
      company_id: req.company_id,
      employee_id: req.user._id,
      subject,
      description,
      status: 'open'
    });

    await assistanceRepository.save(assistance);

    return res.status(201).json({
      message: 'Demande d\'assistance créée.',
      assistance
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
 * GET /api/employee/assistance
 * Liste les demandes d'assistance de l'employé connecté.
 */
async function listAssistanceEmployee(req, res, next) {
  const assistanceRepository = AppDataSource.getRepository(AssistanceRequest);
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {
      company_id: req.company_id,
      employee_id: req.user._id
    };
    if (req.query.status) filter.status = req.query.status;

    const [requests, total] = await Promise.all([
      assistanceRepository.find({
        where: filter,
        order: { createdAt: 'DESC' },
        skip,
        take: limit
      }),
      assistanceRepository.count({ where: filter })
    ]);

    return res.status(200).json({
      data: requests,
      meta: {
        current_page: page,
        last_page: Math.ceil(total / limit),
        total,
        per_page: limit
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/assistance-requests
 * Liste toutes les demandes d'assistance de l'entreprise.
 */
async function listAssistanceAdmin(req, res, next) {
  const assistanceRepository = AppDataSource.getRepository(AssistanceRequest);
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { company_id: req.company_id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.employee_id) filter.employee_id = req.query.employee_id;

    const [requests, total] = await Promise.all([
      assistanceRepository.find({
        where: filter,
        order: { createdAt: 'DESC' },
        skip,
        take: limit
      }),
      assistanceRepository.count({ where: filter })
    ]);

    return res.status(200).json({
      data: requests,
      meta: {
        current_page: page,
        last_page: Math.ceil(total / limit),
        total,
        per_page: limit
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/assistance-requests/:id/respond
 * Répond à une demande d'assistance et éventuellement change le statut.
 */
async function respondAssistance(req, res, next) {
  const assistanceRepository = AppDataSource.getRepository(AssistanceRequest);
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const { id } = idParamSchema.parse(req.params);
    const { response, status } = respondAssistanceSchema.parse(req.body);

    const assistance = await assistanceRepository.findOne({
      where: { _id: id, company_id: req.company_id }
    });

    if (!assistance) {
      return res.status(404).json({ message: 'Demande d\'assistance non trouvée.' });
    }

    assistance.response = response;
    assistance.responded_by = req.user._id;
    assistance.responded_at = new Date();
    if (status) assistance.status = status;
    else assistance.status = 'resolved';

    await assistanceRepository.save(assistance);

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'assistance.responded',
        entity_type: 'AssistanceRequest',
        entity_id: assistance._id,
        metadata: { employee_id: assistance.employee_id }
      })
    );

    // Notifier l'employé
    await notificationService.createNotification({
      companyId: req.company_id,
      recipientId: assistance.employee_id,
      title: 'Réponse à votre demande d\'assistance',
      body: response,
      type: 'system',
      data: { assistance_id: assistance._id.toString() }
    });

    return res.status(200).json({
      message: 'Réponse envoyée.',
      assistance
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
  createAssistance,
  listAssistanceEmployee,
  listAssistanceAdmin,
  respondAssistance
};