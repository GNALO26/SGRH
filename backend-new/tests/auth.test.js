const request = require('supertest');
const app = require('../src/app');
const AppDataSource = require('../src/config/typeorm');
const User = require('../src/entities/User');
const Company = require('../src/entities/Company');
const bcrypt = require('bcryptjs');

describe('Authentification', () => {
  let company;
  let adminUser;
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
  });

  test('POST /api/login - retourne un token temporaire', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'admin@test.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.temp_token).toBeDefined();
    expect(response.body.two_factor_required).toBe(true);
  });

  test('POST /api/verify-2fa - code correct retourne token', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    const tempToken = loginRes.body.temp_token;
    const user = await userRepository.findOne({ where: { email: 'admin@test.com' } });
    const code = user.two_factor_code;

    const response = await request(app)
      .post('/api/verify-2fa')
      .send({ temp_token: tempToken, code });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});