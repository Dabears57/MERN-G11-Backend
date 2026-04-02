const noteModel = require("../models/notes");

async function createNote(userId, content, parentType, parentId, createdAt){
    // validate parentType
    const ValidParentTypes = await findParentTypes();

    if(!ValidParentTypes.includes(parentType)){
        throw new Error(`invalid ParentType: ${ValidParentTypes.toString()}`);
    }

    return await noteModel.createNote(
        userId,
        content, 
        parentType, 
        parentId, 
        createdAt);
}

async function findNote(searchQueryObject){
    return await noteModel.findNote(searchQueryObject);
}

async function findNotes(searchQueryObject){
    return await noteModel.findNotes(searchQueryObject);
}

async function deleteNote(userId, reqid){
    const res = await noteModel.deleteNote(reqid, userId); 
    return res;
}

async function findParentTypes(){
    return await noteModel.findParentTypes();
}

module.exports = {
    createNote,
    findNote,
    findNotes,
    findParentTypes,
    deleteNote
}