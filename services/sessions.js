const sessionModel = require("../models/sessions");

async function createSession(userId, projectId){
    // ensure we don't have an active session
    // this is not concurrency safe, but serves as an early check
    const isSessionActive = await existsActiveSession(userId);
    if(isSessionActive){
        return false;
    }

    // create session which will do the check for us (does not start it)
    return await sessionModel.createSession(userId, {
        projectId: projectId,
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
        };
    }

    // session is active
    return {
        "status": "in-progress",
        "currentTimeStamp": currTime,
        "timeElapsedSecs": elapsedTime,
    };
}

async function resumeSession(userId){
    return await sessionModel.resumeSession(userId);
}

async function pauseSession(userId){
    return await sessionModel.pauseSession(userId);
}

async function stopSession(userId){
    return await sessionModel.stopSession(userId);
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

module.exports = {
    createSession,
    findActiveSession,
    existsActiveSession,
    getStatus,
    resumeSession,
    pauseSession,
    stopSession
};