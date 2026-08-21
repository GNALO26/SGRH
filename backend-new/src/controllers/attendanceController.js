const { z } = require('zod');
const attendanceService = require('../services/attendanceService');
const AppDataSource = require('../config/typeorm');
const Attendance = require('../entities/Attendance');

// Schéma de validation pour le pointage employé
const attendanceSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(['check_in', 'check_out'])
});

/**
 * POST /api/employee/attendance
 * Enregistre un pointage (check-in ou check-out).
 */
async function createAttendance(req, res, next) {
  try {
    const { latitude, longitude, type } = attendanceSchema.parse(req.body);
    const attendance = await attendanceService.createAttendance(req.user, { latitude, longitude, type });

    return res.status(201).json({
      message: type === 'check_in' ? 'Arrivée enregistrée.' : 'Départ enregistré.',
      attendance
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Erreur de validation.',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    if (error.message.includes('déjà pointé') || error.message.includes('d\'abord pointer')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * GET /api/employee/attendance/today
 * Récupère le pointage du jour.
 */
async function getTodayAttendance(req, res, next) {
  try {
    const attendance = await attendanceService.getTodayAttendance(req.user);
    return res.status(200).json({ attendance });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/employee/attendance/history
 * Récupère l'historique paginé des pointages.
 */
async function getAttendanceHistory(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await attendanceService.getAttendanceHistory(req.user, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/employee/attendance/export
 * Exporte l'historique complet des pointages.
 */
async function exportAttendance(req, res, next) {
  try {
    const attendances = await attendanceService.exportAttendanceHistory(req.user);
    return res.status(200).json({
      data: attendances,
      total: attendances.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/attendances
 * Liste les pointages de tous les employés (admin) avec pagination et filtres.
 */
async function listAttendancesAdmin(req, res, next) {
  const attendanceRepository = AppDataSource.getRepository(Attendance);
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { company_id: req.company_id };

    if (req.query.employee_id) filter.employee_id = req.query.employee_id;
    if (req.query.date) {
      const date = new Date(req.query.date);
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }
    if (req.query.status) filter.status = req.query.status;

    const [attendances, total] = await Promise.all([
      attendanceRepository.find({
        where: filter,
        order: { date: 'DESC' },
        skip,
        take: limit
      }),
      attendanceRepository.count({ where: filter })
    ]);

    return res.status(200).json({
      data: attendances,
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

module.exports = {
  createAttendance,
  getTodayAttendance,
  getAttendanceHistory,
  exportAttendance,
  listAttendancesAdmin
};