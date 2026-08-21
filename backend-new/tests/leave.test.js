const request = require('supertest');
const app = require('../src/app');
const AppDataSource = require('../src/config/typeorm');
const User = require('../src/entities/User');
const Company = require('../src/entities/Company');
const Leave = require('../src/entities/Leave');
const bcrypt = require('bcryptjs');

describe('Congés', () => {
  let company;
  let employeeUser;
  let employeeToken;
  let adminUser;
  let adminToken;
  let userRepository;
  let companyRepository;

  beforeEach(async () => {
    userRepository = AppDataSource.getRepository(User);
    companyRepository = AppDataSource.getRepository(Company);

    company = await companyRepository.save(
      companyRepository.create({
        name: 'Test Company',
        slug: 'test-company',
        plan: 'trial'
      })
    );

    employeeUser = await userRepository.save(
      userRepository.create({
        company_id: company._id,
        name: 'Employee',
        email: 'employee@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee'
      })
    );

    adminUser = await userRepository.save(
      userRepository.create({
        company_id: company._id,
        name: 'Admin',
        email: 'admin@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'admin'
      })
    );

    // Token employé
    const empLogin = await request(app)
      .post('/api/login')
      .send({ email: 'employee@test.com', password: 'password123' });
    const empCode = (await userRepository.findOne({ where: { email: 'employee@test.com' } })).two_factor_code;
    const empVerify = await request(app)
      .post('/api/verify-2fa')
      .send({ temp_token: empLogin.body.temp_token, code: empCode });
    employeeToken = empVerify.body.token;

    // Token admin
    const admLogin = await request(app)
      .post('/api/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    const admCode = (await userRepository.findOne({ where: { email: 'admin@test.com' } })).two_factor_code;
    const admVerify = await request(app)
      .post('/api/verify-2fa')
      .send({ temp_token: admLogin.body.temp_token, code: admCode });
    adminToken = admVerify.body.token;
  });

  test('POST /api/employee/leaves - crée une demande de congé', async () => {
    const response = await request(app)
      .post('/api/employee/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leave_type: 'annual',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        reason: 'Vacances'
      });

    expect(response.status).toBe(201);
    expect(response.body.leave.status).toBe('pending');
  });

  test('PATCH /api/admin/leaves/:id - approuve un congé', async () => {
    const leaveRepository = AppDataSource.getRepository(Leave);
    const leave = await leaveRepository.save(
      leaveRepository.create({
        company_id: company._id,
        employee_id: employeeUser._id,
        leave_type: 'annual',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-05'),
        status: 'pending'
      })
    );

    const response = await request(app)
      .patch(`/api/admin/leaves/${leave._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });

    expect(response.status).toBe(200);
    expect(response.body.leave.status).toBe('approved');
  });
});