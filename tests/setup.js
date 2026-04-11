const mongoUtils = require('../utils/mongo-utils');
const userModel = require('../models/user');
const sessionModel = require('../models/sessions');

beforeAll(async () => {
  await mongoUtils.connect(process.env.MONGODB_TEST_URI);
  await Promise.all([
    userModel.init(),
    sessionModel.init(),
  ]);
});
