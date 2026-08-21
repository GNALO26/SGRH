const AppDataSource = require('../config/typeorm');
const UnjustifiedAbsence = require('../entities/UnjustifiedAbsence');
const Attendance = require('../entities/Attendance');
const Leave = require('../entities/Leave');
const Holiday = require('../entities/Holiday');
const User = require('../entities/User');

/**
 * Liste les absences non justifiées avec filtres et pagination.
 */
async function listUnjustifiedAbsences(filter, page = 1, limit = 20) {
  const absenceRepository = AppDataSource.getRepository(UnjustifiedAbsence);
  const skip = (page - 1) * limit;

  const [absences, total] = await Promise.all([
    absenceRepository.find({
      where: filter,
      order: { date: 'DESC' },
      skip,
      take: limit,
      relations: ['employee_id'] // Il faudra définir des relations pour la jointure si besoin, sinon on peut juste laisser les IDs
    }),
    absenceRepository.count({ where: filter })
  ]);

  return {
    data: absences,
    meta: {
      current_page: page,
      last_page: Math.ceil(total / limit),
      total,
      per_page: limit
    }
  };
}

/**
 * Récupère une absence par ID.
 */
async function getAbsenceById(id, companyId) {
  const absenceRepository = AppDataSource.getRepository(UnjustifiedAbsence);
  return absenceRepository.findOne({
    where: { _id: id, company_id: companyId }
  });
}

/**
 * Soumet une explication pour une absence non justifiée.
 */
async function explainAbsence(id, companyId, employeeId, explanation) {
  const absenceRepository = AppDataSource.getRepository(UnjustifiedAbsence);
  const absence = await absenceRepository.findOne({
    where: { _id: id, company_id: companyId, employee_id: employeeId }
  });
  if (!absence) return null;

  absence.explanation = explanation;
  absence.explanation_submitted_at = new Date();
  absence.status = 'explained';
  await absenceRepository.save(absence);
  return absence;
}

/**
 * Vérifie si une date est un jour ouvré.
 */
async function isWorkingDay(date, companyId) {
  const holidayRepository = AppDataSource.getRepository(Holiday);
  const dayOfWeek = date.getUTCDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const holiday = await holidayRepository.findOne({
    where: {
      company_id: companyId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }
  });

  return !holiday;
}

/**
 * Détecte les absences non justifiées pour un employé.
 */
async function detectAbsencesForEmployee(companyId, employeeId, targetDate = new Date()) {
  const attendanceRepository = AppDataSource.getRepository(Attendance);
  const leaveRepository = AppDataSource.getRepository(Leave);
  const absenceRepository = AppDataSource.getRepository(UnjustifiedAbsence);

  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCHours(23, 59, 59, 999);

  if (!(await isWorkingDay(startOfDay, companyId))) return null;

  const attendance = await attendanceRepository.findOne({
    where: {
      company_id: companyId,
      employee_id: employeeId,
      date: { $gte: startOfDay, $lt: endOfDay },
      check_in_time: { $ne: null }
    }
  });

  if (attendance) return null;

  const leave = await leaveRepository.findOne({
    where: {
      company_id: companyId,
      employee_id: employeeId,
      status: 'approved',
      start_date: { $lte: endOfDay },
      end_date: { $gte: startOfDay }
    }
  });

  if (leave) return null;

  const existingAbsence = await absenceRepository.findOne({
    where: {
      company_id: companyId,
      employee_id: employeeId,
      date: { $gte: startOfDay, $lt: endOfDay }
    }
  });

  if (existingAbsence) return null;

  const absence = absenceRepository.create({
    company_id: companyId,
    employee_id: employeeId,
    date: startOfDay,
    status: 'unexplained'
  });

  await absenceRepository.save(absence);
  return absence;
}

/**
 * Détecte les absences pour tous les employés d'une entreprise.
 */
async function detectAbsencesForCompany(companyId, targetDate = new Date()) {
  const userRepository = AppDataSource.getRepository(User);
  const employees = await userRepository.find({
    where: { company_id: companyId, role: 'employee', is_active: true }
  });

  let created = 0;
  for (const employee of employees) {
    const absence = await detectAbsencesForEmployee(companyId, employee._id, targetDate);
    if (absence) created++;
  }

  return created;
}

module.exports = {
  listUnjustifiedAbsences,
  getAbsenceById,
  explainAbsence,
  detectAbsencesForEmployee,
  detectAbsencesForCompany
};