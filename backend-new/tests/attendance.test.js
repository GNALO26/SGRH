const request = require('supertest');
const app = require('../src/app');
const AppDataSource = require('../src/config/typeorm');
const User = require('../src/entities/User');
const Company = require('../src/entities/Company');
const Attendance = require('../src/entities/Attendance');
const bcrypt = require('bcryptjs');

describe('Pointage (Employee)', () => {
  let company;
  let employeeUser;
  let employeeToken;
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
        name: 'Employee Test',
        email: 'employee@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        company_latitude: 6.3654,
        company_longitude: 2.4183,
        geofence_radius_meters: 200
      })
    );

    const loginRes = await request(app)
      .post('/api/login')
      .send({ email: 'employee@test.com', password: 'password123' });
    const tempToken = loginRes.body.temp_token;
    const user = await userRepository.findOne({ where: { email: 'employee@test.com' } });
    const code = user.two_factor_code;
    const verifyRes = await request(app)
      .post('/api/verify-2fa')
      .send({ temp_token: tempToken, code });
    employeeToken = verifyRes.body.token;
  });

  test('POST /api/employee/attendance - check-in valide', async () => {
    const response = await request(app)
      .post('/api/employee/attendance')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        latitude: 6.3654,
        longitude: 2.4183,
        type: 'check_in'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Arrivée enregistrée.');
    expect(response.body.attendance.check_in_time).toBeDefined();
  });

  test('POST /api/employee/attendance - double check-in retourne 400', async () => {
    await request(app)
      .post('/api/employee/attendance')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ latitude: 6.3654, longitude: 2.4183, type: 'check_in' });

    const response = await request(app)
      .post('/api/employee/attendance')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ latitude: 6.3654, longitude: 2.4183, type: 'check_in' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('déjà pointé');
  });
});