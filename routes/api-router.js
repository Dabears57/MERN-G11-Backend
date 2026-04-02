const express = require('express');

// create API router
const apiRouter = express.Router();

// setup user router
const userRouter = require('./user-router');
apiRouter.use('/users', userRouter);

// note router
const noteRouter = require("./notes-router");
apiRouter.use("/notes", noteRouter);

// tell express to now user the API router
module.exports = apiRouter;