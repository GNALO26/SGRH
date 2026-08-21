const { absenceQueue } = require('../services/queueService');
const absenceService = require('../services/absenceService');

absenceQueue.process(async (job) => {
  const { companyId, employeeId, targetDate } = job.data;

  if (employeeId) {
    await absenceService.detectAbsencesForEmployee(companyId, employeeId, targetDate ? new Date(targetDate) : new Date());
  } else {
    await absenceService.detectAbsencesForCompany(companyId, targetDate ? new Date(targetDate) : new Date());
  }
});

module.exports = absenceQueue;