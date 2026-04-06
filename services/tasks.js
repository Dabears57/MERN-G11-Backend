const taskModel = require("../models/tasks");
const { ObjectId } = require("mongodb");

// CREATE
async function createTask(userId, projectId, name, description){
    if(!projectId || !name){
        throw new Error("missing required fields: projectId or name");
    }

    const task = {
        projectId: new ObjectId(projectId),
        userId: userId,
        name,
        description: description || "",
        startDate: null,
        endDate: null,
        totalTime: 0,
        todos: []
    };

    return await taskModel.createTask(task);
}

// FIND ONE
async function findTask(userId, searchQueryObject){
    // cast projectId to object id
    if(searchQueryObject.projectId){
        searchQueryObject.projectId = new ObjectId(searchQueryObject.projectId);
    }

    searchQueryObject.userId = userId; // set userId
    return await taskModel.findTask(searchQueryObject);
}

// FIND MANY
async function findTasks(userId, searchQueryObject){
    if(searchQueryObject.projectId){
        searchQueryObject.projectId = new ObjectId(searchQueryObject.projectId);
    }

    searchQueryObject.userId = userId; // set userId
    return await taskModel.findTasks(searchQueryObject);
}

// UPDATE
async function updateTask(userId, id, updateObject){
    if(!id){
        throw new Error("missing task id");
    }
    if(updateObject.projectId){
        updateObject.projectId = new ObjectId(updateObject.projectId);
    }

    return await taskModel.updateTask(userId, id, updateObject);
}

// DELETE
async function deleteTask(userId, id){
    if(!id){
        throw new Error("missing task id");
    }

    return await taskModel.deleteTask(userId, new ObjectId(id));
}

module.exports = {
    createTask,
    findTask,
    findTasks,
    updateTask,
    deleteTask
};