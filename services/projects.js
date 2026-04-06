const { ObjectId } = require("mongodb");
const projectModel = require("../models/projects");

// CREATE
async function createProject(title, description, userId){
    if(!title || !description || !userId){
        throw new Error("missing required fields: title, description, userId");
    }

    const project = {
        title,
        description,
        startDate: new Date(),
        endDate: null,
        totalTime: 0,
        userId: userId
    };

    return await projectModel.createProject(project);
}

// FIND ONE
async function findProject(userId, searchQueryObject){
    searchQueryObject.userId = userId; // force userId
    if(searchQueryObject._id){
        searchQueryObject._id = new ObjectId(searchQueryObject._id);
    }

    return await projectModel.findProject(searchQueryObject);
}

// FIND MANY
async function findProjects(userId, searchQueryObject){
    searchQueryObject.userId = userId; // force userId
    if(searchQueryObject._id){
        searchQueryObject._id = new ObjectId(searchQueryObject._id);
    }

    return await projectModel.findProjects(searchQueryObject);
}

// UPDATE
async function updateProject(userId, id, updateObject){
    if(!id){
        throw new Error("missing project id");
    }

    return await projectModel.updateProject(userId, new ObjectId(id), updateObject);
}

// DELETE
async function deleteProject(userId, id){
    if(!id){
        throw new Error("missing project id");
    }

    return await projectModel.deleteProject(userId, new ObjectId(id));
}

module.exports = {
    createProject,
    findProject,
    findProjects,
    updateProject,
    deleteProject
};