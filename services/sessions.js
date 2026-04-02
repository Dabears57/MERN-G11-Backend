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

    return sessionModel.createSession(session);
}

// STOP SESSION
async function stopSession(id){
    if(!id){
        throw new Error("missing session id");
    }

    return sessionModel.updateSession(id, {
        endTime: new Date()
    });
}

// FIND
async function findSession(query){
    return sessionModel.findSession(query);
}

async function findSessions(query){
    return sessionModel.findSessions(query);
}

// UPDATE
async function updateSession(id, update){
    if(!id){
        throw new Error("missing session id");
    }

    return sessionModel.updateSession(id, update);
}

// DELETE
async function deleteSession(id){
    if(!id){
        throw new Error("missing session id");
    }

    return sessionModel.deleteSession(id);
}

module.exports = {
    createSession,
    stopSession,
    findSession,
    findSessions,
    updateSession,
    deleteSession
};