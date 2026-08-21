// Rôles utilisateur
const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

// Types de congés
const LEAVE_TYPES = {
  ANNUAL: 'annual',
  SICK: 'sick',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  UNPAID: 'unpaid',
  OTHER: 'other'
};

// Statuts des congés
const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Statuts des autorisations de retard
const RETARD_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Statuts des absences non justifiées
const ABSENCE_STATUS = {
  UNEXPLAINED: 'unexplained',
  EXPLAINED: 'explained',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

// Statuts des présences
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  HALF_DAY: 'half_day',
  HOLIDAY: 'holiday',
  WEEKEND: 'weekend'
};

// Statuts des demandes d'assistance
const ASSISTANCE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

module.exports = {
  ROLES,
  LEAVE_TYPES,
  LEAVE_STATUS,
  RETARD_STATUS,
  ABSENCE_STATUS,
  ATTENDANCE_STATUS,
  ASSISTANCE_STATUS
};