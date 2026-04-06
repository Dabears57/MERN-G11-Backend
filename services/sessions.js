const sessionModel = require("../models/sessions");
const projectModel = require("../models/projects")
const taskModel = require("../models/tasks");
const { ObjectId } = require("mongodb");

async function createSession(userId, projectId){
    // ensure we don't have an active session
    // this is not concurrency safe, but serves as an early check
    const isSessionActive = await existsActiveSession(userId);
    if(isSessionActive){
        return false;
    }

    // create session which will do the check for us (does not start it)
    return await sessionModel.createSession(userId, {
        projectId: new ObjectId(projectId),
        currentTime: new Date(),
        endTime: null,
        paused: true,
        breaks: [],
        totalTime: 0
    });
}

async function getStatus(userId){
    const activeSession = await sessionModel.fetchAndUpdateActiveSession(userId);

    // no active session
    if(!activeSession){
        return {
            "status": "no active session",
            "currentTimeStamp": null,
            "timeElapsedSecs": 0,
        };
    }

    const isPaused = activeSession.paused;
    const currTime = activeSession.currentTime;
    const elapsedTime = activeSession.totalTime;

    console.log(activeSession);

    if(isPaused){
        return {
            "status": "paused",
            "currentTimeStamp": currTime,
            "timeElapsedSecs": elapsedTime,
            "all": activeSession
        };
    }

    // session is active
    return {
        "status": "in-progress",
        "currentTimeStamp": currTime,
        "timeElapsedSecs": elapsedTime,
        "all": activeSession
    };
}

async function resumeSession(userId){
    return await sessionModel.resumeSession(userId);
}

async function pauseSession(userId){
    return await sessionModel.pauseSession(userId);
}

async function stopSessionAndCommit(userId) {
  // Step 1: Atomically fetch session, update final session time and paused tasks
  const session = await sessionModel.stopAndUpdate(userId);
  console.log("stopped and updated session");
  
  if (!session) return null;

  // Step 2: Commit task totalTime to the actual task collection
  if(session.tasks != null){
    console.log("updating tasks");
    const taskUpdates = session.tasks.map(async (t) => {
        console.log("taskid",t.taskId,"totaltime:",t.totalTime);
        await taskModel.incrementTotalTime(t.taskId, t.totalTime);
    });

    await Promise.all(taskUpdates);
  }

  // Step 3: Commit total session time to project
  console.log("updating project times");
  await projectModel.incrementTotalTime(session.projectId, session.totalTime);

  // Step 4: Mark session as inactive
  await sessionModel.markInactive(session._id);

  return session;
}

async function findActiveSession(userId){
    return await sessionModel.findActiveSession(userId);
}

async function existsActiveSession(userId){
    const result = await findActiveSession(userId);
    if(!result){
        return false;
    }

    return true;
}

async function addTask(userId, taskId) {
  // 1. fetch active session
  const session = await sessionModel.findActiveSession(userId);
  if (!session) throw new Error("No active session found");

  // 2. modify session tasks
  const updatedSession = await sessionModel.modifySessionTask(session._id, taskId, "add");
  return updatedSession;
}

async function removeTask(userId, taskId) {
  const session = await sessionModel.findActiveSession(userId);
  if (!session) throw new Error("No active session found");

  const updatedSession = await sessionModel.modifySessionTask(session._id, taskId, "remove");
  return updatedSession;
}

// for find operations you must restrict it to our current user
async function findSession(userId, query){
    query.userId = userId;
    if(!query.userId){
        throw new Error("invalid Query no UserID");
    }

    // move it to a mongodb objectId
    if(query._id){
        query._id = new ObjectId(query._id);
    }
    if(query.projectId){
        query.projectId = new ObjectId(query.projectId);
    }

    const res = await sessionModel.findSession(query);
    return res;

}

async function findSessions(userId, query){
    query.userId = userId;
    if(!query.userId){
        throw new Error("invalid Query no UserID");
    }

    // move it to a mongodb objectId
    if(query._id){
        query._id = new ObjectId(query._id);
    }
    if(query.projectId){
        query.projectId = new ObjectId(query.projectId);
    }

    return await sessionModel.findSessions(query);
}

module.exports = {
    createSession,
    findActiveSession,
    existsActiveSession,
    getStatus,
    resumeSession,
    pauseSession,
    stopSessionAndCommit,
    addTask,
    removeTask,
    findSession,
    findSessions
};