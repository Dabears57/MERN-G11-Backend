const taskModel = require("../models/tasks");

// CREATE
async function createTask(projectId, name, description){
    if(!projectId || !name){
        throw new Error("missing required fields: projectId or name");
    }

    const task = {
        projectId,
        name,
        description: description || "",
        startDate: null,
        endDate: null,
        timeSpent: 0,
        todos: []
    };

    return await taskModel.createTask(task);
}

// FIND ONE
async function findTask(searchQueryObject){
    return await taskModel.findTask(searchQueryObject);
}

// FIND MANY
async function findTasks(searchQueryObject){
    return await taskModel.findTasks(searchQueryObject);
}

// UPDATE
async function updateTask(id, updateObject){
    if(!id){
        throw new Error("missing task id");
    }

    return await taskModel.updateTask(id, updateObject);
}

// DELETE
async function deleteTask(id){
    if(!id){
        throw new Error("missing task id");
    }

    return await taskModel.deleteTask(id);
}

module.exports = {
    createTask,
    findTask,
    findTasks,
    updateTask,
    deleteTask
};