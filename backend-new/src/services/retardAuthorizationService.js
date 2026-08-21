const AppDataSource = require('../config/typeorm');
const RetardAuthorization = require('../entities/RetardAuthorization');

async function createRetardAuthorization(data, companyId, employeeId) {
  const authorizationRepository = AppDataSource.getRepository(RetardAuthorization);
  const authorization = authorizationRepository.create({
    company_id: companyId,
    employee_id: employeeId,
    date: data.date,
    reason: data.reason,
    status: 'pending'
  });
  await authorizationRepository.save(authorization);
  return authorization;
}

async function listRetardAuthorizations(filter, page = 1, limit = 20) {
  const authorizationRepository = AppDataSource.getRepository(RetardAuthorization);
  const skip = (page - 1) * limit;

  const [authorizations, total] = await Promise.all([
    authorizationRepository.find({
      where: filter,
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    }),
    authorizationRepository.count({ where: filter })
  ]);

  return {
    data: authorizations,
    meta: {
      current_page: page,
      last_page: Math.ceil(total / limit),
      total,
      per_page: limit
    }
  };
}

async function updateRetardAuthorizationStatus(id, companyId, data) {
  const authorizationRepository = AppDataSource.getRepository(RetardAuthorization);
  const authorization = await authorizationRepository.findOne({ where: { _id: id, company_id: companyId } });
  if (!authorization) return null;

  authorization.status = data.status;
  if (data.status === 'approved' || data.status === 'rejected') {
    authorization.approved_by = data.approved_by;
    authorization.approved_at = new Date();
  }

  await authorizationRepository.save(authorization);
  return authorization;
}

async function deleteRetardAuthorization(id, companyId, employeeId) {
  const authorizationRepository = AppDataSource.getRepository(RetardAuthorization);
  const authorization = await authorizationRepository.findOne({
    where: { _id: id, company_id: companyId, employee_id: employeeId, status: 'pending' }
  });
  if (!authorization) return null;
  await authorizationRepository.remove(authorization);
  return authorization;
}

module.exports = {
  createRetardAuthorization,
  listRetardAuthorizations,
  updateRetardAuthorizationStatus,
  deleteRetardAuthorization
};