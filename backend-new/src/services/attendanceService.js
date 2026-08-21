const AppDataSource = require('../config/typeorm');
const Attendance = require('../entities/Attendance');
const User = require('../entities/User');
const { isWithinGeofence } = require('./geoFencingService');

/**
 * Crée un pointage (check-in ou check-out) pour un employé.
 */
async function createAttendance(user, data) {
  const attendanceRepository = AppDataSource.getRepository(Attendance);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let attendance = await attendanceRepository.findOne({
    where: {
      company_id: user.company_id,
      employee_id: user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    }
  });

  if (data.type === 'check_in') {
    if (attendance && attendance.check_in_time) {
      throw new Error('Vous avez déjà pointé votre arrivée aujourd\'hui.');
    }

    if (!attendance) {
      attendance = attendanceRepository.create({
        company_id: user.company_id,
        employee_id: user._id,
        date: today
      });
    }

    attendance.check_in_time = new Date();
    attendance.check_in_latitude = data.latitude;
    attendance.check_in_longitude = data.longitude;

    if (user.company_latitude && user.company_longitude) {
      const geofenceResult = isWithinGeofence(
        data.latitude,
        data.longitude,
        user.company_latitude,
        user.company_longitude,
        user.geofence_radius_meters || 200
      );
      attendance.check_in_distance_meters = geofenceResult.distance;
      if (!geofenceResult.allowed) {
        attendance.notes = 'Pointage effectué hors de la zone autorisée.';
      }
    }

    const now = new Date();
    const openingTime = user.official_opening_time || '08:00';
    const [hours, minutes] = openingTime.split(':').map(Number);
    const openingDate = new Date();
    openingDate.setUTCHours(hours, minutes, 0, 0);

    if (now > openingDate) {
      attendance.status = 'late';
    } else {
      attendance.status = 'present';
    }

    await attendanceRepository.save(attendance);
    return attendance;
  }

  if (data.type === 'check_out') {
    if (!attendance || !attendance.check_in_time) {
      throw new Error('Vous devez d\'abord pointer votre arrivée.');
    }

    if (attendance.check_out_time) {
      throw new Error('Vous avez déjà pointé votre départ aujourd\'hui.');
    }

    attendance.check_out_time = new Date();
    attendance.check_out_latitude = data.latitude;
    attendance.check_out_longitude = data.longitude;

    if (user.company_latitude && user.company_longitude) {
      const geofenceResult = isWithinGeofence(
        data.latitude,
        data.longitude,
        user.company_latitude,
        user.company_longitude,
        user.geofence_radius_meters || 200
      );
      attendance.check_out_distance_meters = geofenceResult.distance;
      if (!geofenceResult.allowed) {
        attendance.notes = attendance.notes
          ? attendance.notes + ' Pointage de sortie hors zone.'
          : 'Pointage de sortie hors zone.';
      }
    }

    await attendanceRepository.save(attendance);
    return attendance;
  }

  throw new Error('Type de pointage invalide.');
}

/**
 * Récupère le pointage du jour pour un employé.
 */
async function getTodayAttendance(user) {
  const attendanceRepository = AppDataSource.getRepository(Attendance);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return attendanceRepository.findOne({
    where: {
      company_id: user.company_id,
      employee_id: user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    }
  });
}

/**
 * Récupère l'historique des pointages avec pagination.
 */
async function getAttendanceHistory(user, page = 1, limit = 20) {
  const attendanceRepository = AppDataSource.getRepository(Attendance);
  const skip = (page - 1) * limit;

  const filter = {
    company_id: user.company_id,
    employee_id: user._id
  };

  const [attendances, total] = await Promise.all([
    attendanceRepository.find({
      where: filter,
      order: { date: 'DESC' },
      skip,
      take: limit
    }),
    attendanceRepository.count({ where: filter })
  ]);

  return {
    data: attendances,
    meta: {
      current_page: page,
      last_page: Math.ceil(total / limit),
      total,
      per_page: limit
    }
  };
}

/**
 * Exporte l'historique complet.
 */
async function exportAttendanceHistory(user) {
  const attendanceRepository = AppDataSource.getRepository(Attendance);
  return attendanceRepository.find({
    where: {
      company_id: user.company_id,
      employee_id: user._id
    },
    order: { date: 'DESC' }
  });
}

module.exports = {
  createAttendance,
  getTodayAttendance,
  getAttendanceHistory,
  exportAttendanceHistory
};