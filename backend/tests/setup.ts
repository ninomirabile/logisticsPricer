import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { seedTariffs } from '../src/utils/tariffSeeder';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
  
  // Seed tariff data for tests
  await seedTariffs();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
  
  // Re-seed tariffs after each test
  await seedTariffs();
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
}); 