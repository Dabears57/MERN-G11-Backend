const sessionModel = require("../models/sessions");

// START SESSION
async function createSession(projectId){
    if(!projectId){
        throw new Error("missing projectId");
    }

    const session = {
        projectId,
        startTime: new Date(),
        endTime: null,
        tasksWorked: [],
        breaks: []
    };

    return await sessionModel.createSession(session);
}

// STOP SESSION
async function stopSession(id){
    if(!id){
        throw new Error("missing session id");
    }

    return await sessionModel.updateSession(id, {
        endTime: new Date()
    });
}

// FIND
async function findSession(query){
    return await sessionModel.findSession(query);
}

async function findSessions(query){
    return await sessionModel.findSessions(query);
}

// UPDATE
async function updateSession(id, update){
    if(!id){
        throw new Error("missing session id");
    }

    return await sessionModel.updateSession(id, update);
}

// DELETE
async function deleteSession(id){
    if(!id){
        throw new Error("missing session id");
    }

    return await sessionModel.deleteSession(id);
}

module.exports = {
    createSession,
    stopSession,
    findSession,
    findSessions,
    updateSession,
    deleteSession
};