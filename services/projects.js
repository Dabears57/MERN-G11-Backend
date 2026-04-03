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
async function findProject(searchQueryObject){
    return await projectModel.findProject(searchQueryObject);
}

// FIND MANY
async function findProjects(searchQueryObject){
    return await projectModel.findProjects(searchQueryObject);
}

// UPDATE
async function updateProject(id, updateObject){
    if(!id){
        throw new Error("missing project id");
    }

    return await projectModel.updateProject(id, updateObject);
}

// DELETE
async function deleteProject(id){
    if(!id){
        throw new Error("missing project id");
    }

    return await projectModel.deleteProject(id);
}

module.exports = {
    createProject,
    findProject,
    findProjects,
    updateProject,
    deleteProject
};