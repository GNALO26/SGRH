const AppDataSource = require('../config/typeorm');
const Leave = require('../entities/Leave');

async function createLeave(data, companyId, employeeId) {
  const leaveRepository = AppDataSource.getRepository(Leave);
  const leave = leaveRepository.create({
    company_id: companyId,
    employee_id: employeeId,
    leave_type: data.leave_type,
    start_date: data.start_date,
    end_date: data.end_date,
    reason: data.reason || null,
    status: 'pending'
  });
  await leaveRepository.save(leave);
  return leave;
}

async function listLeaves(filter, page = 1, limit = 20) {
  const leaveRepository = AppDataSource.getRepository(Leave);
  const skip = (page - 1) * limit;

  const [leaves, total] = await Promise.all([
    leaveRepository.find({
      where: filter,
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    }),
    leaveRepository.count({ where: filter })
  ]);

  return {
    data: leaves,
    meta: {
      current_page: page,
      last_page: Math.ceil(total / limit),
      total,
      per_page: limit
    }
  };
}

async function getLeaveById(id, companyId) {
  const leaveRepository = AppDataSource.getRepository(Leave);
  return leaveRepository.findOne({ where: { _id: id, company_id: companyId } });
}

async function updateLeaveStatus(id, companyId, data) {
  const leaveRepository = AppDataSource.getRepository(Leave);
  const leave = await leaveRepository.findOne({ where: { _id: id, company_id: companyId } });
  if (!leave) return null;

  leave.status = data.status;
  if (data.status === 'approved') {
    leave.approved_by = data.approved_by;
    leave.approved_at = new Date();
    leave.rejection_reason = null;
  } else if (data.status === 'rejected') {
    leave.rejection_reason = data.rejection_reason || null;
    leave.approved_by = data.approved_by;
    leave.approved_at = new Date();
  } else {
    leave.status = data.status;
  }

  await leaveRepository.save(leave);
  return leave;
}

async function deleteLeave(id, companyId, employeeId) {
  const leaveRepository = AppDataSource.getRepository(Leave);
  const leave = await leaveRepository.findOne({
    where: { _id: id, company_id: companyId, employee_id: employeeId, status: 'pending' }
  });
  if (!leave) return null;
  await leaveRepository.remove(leave);
  return leave;
}

module.exports = {
  createLeave,
  listLeaves,
  getLeaveById,
  updateLeaveStatus,
  deleteLeave
};