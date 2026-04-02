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

    return taskModel.createTask(task);
}

// FIND ONE
async function findTask(searchQueryObject){
    return taskModel.findTask(searchQueryObject);
}

// FIND MANY
async function findTasks(searchQueryObject){
    return taskModel.findTasks(searchQueryObject);
}

// UPDATE
async function updateTask(id, updateObject){
    if(!id){
        throw new Error("missing task id");
    }

    return taskModel.updateTask(id, updateObject);
}

// DELETE
async function deleteTask(id){
    if(!id){
        throw new Error("missing task id");
    }

    return taskModel.deleteTask(id);
}

module.exports = {
    createTask,
    findTask,
    findTasks,
    updateTask,
    deleteTask
};