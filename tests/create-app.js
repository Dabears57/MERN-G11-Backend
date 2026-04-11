const express = require('express');
const cookieParser = require('cookie-parser');

// Build the express app the same way server.js does, but without calling listen.
// Required lazily so routes don't execute at require-time before DB is connected.
function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  const apiRouter = require('../routes/api-router');
  app.use('/api', apiRouter);

  return app;
}

module.exports = createApp;
