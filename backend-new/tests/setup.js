const { DataSource } = require('typeorm');
const { MongoMemoryServer } = require('mongodb-memory-server');
const AppDataSource = require('../src/config/typeorm');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRES_IN = '1d';
  process.env.MONGODB_URI = uri;
  AppDataSource.setOptions({ url: uri });
  await AppDataSource.initialize();
});

afterEach(async () => {
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.clear();
  }
});

afterAll(async () => {
  await AppDataSource.destroy();
  await mongoServer.stop();
});