const { z } = require('zod');
const notificationService = require('../services/notificationService');

const readNotificationsSchema = z.object({
  notification_ids: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant notification invalide.')
  ).min(1, 'Au moins une notification est requise.')
});

/**
 * GET /api/admin/notifications
 * Liste les notifications de l'admin connecté.
 */
async function listNotificationsAdmin(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await notificationService.listNotifications(
      req.company_id,
      req.user._id,
      page,
      limit
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/notifications/read
 * Marque des notifications comme lues pour l'admin.
 */
async function markNotificationsReadAdmin(req, res, next) {
  try {
    const { notification_ids } = readNotificationsSchema.parse(req.body);
    const count = await notificationService.markNotificationsAsRead(
      req.company_id,
      req.user._id,
      notification_ids
    );

    return res.status(200).json({ message: 'Notifications marquées comme lues.', count });
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
 * GET /api/employee/notifications
 * Liste les notifications de l'employé connecté.
 */
async function listNotificationsEmployee(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await notificationService.listNotifications(
      req.company_id,
      req.user._id,
      page,
      limit
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/employee/notifications/read
 * Marque des notifications comme lues pour l'employé.
 */
async function markNotificationsReadEmployee(req, res, next) {
  try {
    const { notification_ids } = readNotificationsSchema.parse(req.body);
    const count = await notificationService.markNotificationsAsRead(
      req.company_id,
      req.user._id,
      notification_ids
    );

    return res.status(200).json({ message: 'Notifications marquées comme lues.', count });
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
  listNotificationsAdmin,
  markNotificationsReadAdmin,
  listNotificationsEmployee,
  markNotificationsReadEmployee
};