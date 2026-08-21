const request = require('supertest');
const app = require('../src/app');
const AppDataSource = require('../src/config/typeorm');
const User = require('../src/entities/User');
const Company = require('../src/entities/Company');
const bcrypt = require('bcryptjs');

describe('Gestion des employés (Admin)', () => {
  let company;
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

    adminUser = await userRepository.save(
      userRepository.create({
        company_id: company._id,
        name: 'Admin Test',
        email: 'admin@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'admin'
      })
    );

    const loginRes = await request(app)
      .post('/api/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    const tempToken = loginRes.body.temp_token;
    const user = await userRepository.findOne({ where: { email: 'admin@test.com' } });
    const code = user.two_factor_code;
    const verifyRes = await request(app)
      .post('/api/verify-2fa')
      .send({ temp_token: tempToken, code });
    adminToken = verifyRes.body.token;
  });

  test('POST /api/admin/employees - crée un employé', async () => {
    const response = await request(app)
      .post('/api/admin/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Employee Test',
        email: 'employee@test.com',
        password: 'password123',
        role: 'employee',
        matricule: 'EMP-001'
      });

    expect(response.status).toBe(201);
    expect(response.body.employee.email).toBe('employee@test.com');
    expect(response.body.employee.role).toBe('employee');
  });

  test('GET /api/admin/employees - liste les employés', async () => {
    await userRepository.save(
      userRepository.create({
        company_id: company._id,
        name: 'Employee 1',
        email: 'emp1@test.com',
        password: 'password123',
        role: 'employee'
      })
    );

    const response = await request(app)
      .get('/api/admin/employees')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1); // Seul l'employé ajouté, l'admin n'est pas listé car filtre role employee
  });
});