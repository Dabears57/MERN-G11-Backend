const noteModel = require("../models/notes");

const ValidParentTypes = ["session","project","task"];
const ValidParentTypesStr = ValidParentTypes.toString();

async function createNote(content, parentType, parentId, createdAt){
    // validate parentType
    if(!ValidParentTypes.includes(parentType)){
        throw new Error(`invalid ParentType: ${ValidParentTypesStr}`);
    }

    return noteModel.createNote(
        content, 
        parentType, 
        parentId, 
        createdAt);
}

async function findNote(searchQueryObject){
    return noteModel.findNote(searchQueryObject);
}

async function findNotes(searchQueryObject){
    return noteModel.findNotes(searchQueryObject);
}

module.exports = {
    createNote,
    findNote,
    findNotes
}