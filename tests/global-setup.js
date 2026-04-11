const { MongoMemoryReplSet } = require('mongodb-memory-server');

module.exports = async () => {
  // Use a single-node replica set so transaction-based operations work in tests
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await replSet.waitUntilRunning();
  process.env.MONGODB_TEST_URI = replSet.getUri();
  // APP_URL is needed for verification / password-reset link generation
  process.env.APP_URL = 'http://localhost:3000';
  global.__MONGOD__ = replSet;
};
