const express = require('express');
const cookieParser = require("cookie-parser");


// create API router
const apiRouter = express.Router();
apiRouter.use(cookieParser());

// setup user router
const userRouter = require('./user-router');
apiRouter.use('/users', userRouter);

// note router
const noteRouter = require("./notes-router");
apiRouter.use("/notes", noteRouter);

// project router
const projectRouter = require("./project-router");
apiRouter.use("/projects",projectRouter);

// tasks router
const tasksRouter = require("./task-router");
apiRouter.use("/tasks",tasksRouter);

// sessions router
const sessionsRouter = require("./session-router");
apiRouter.use("/sessions", sessionsRouter);

// tell express to now user the API router
module.exports = apiRouter;