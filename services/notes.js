const noteModel = require("../models/notes");
const { ObjectId } = require("mongodb");

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

async function updateNote(userId, noteId, content){
    return await noteModel.updateNote(userId, new ObjectId(noteId), {
        content: content
    });
}

module.exports = {
    createNote,
    findNote,
    findNotes,
    findParentTypes,
    deleteNote,
    updateNote
}