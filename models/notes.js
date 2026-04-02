const db = require("../utils/mongo-utils");
const DATABASE_STR = "development"; // should change this later 


// lazy load the collection to reduce calls
let _collection = null;

function getCollection() {
    if (_collection) return _collection;

    const dbInstance = db.getDb(DATABASE_STR);

    if (!dbInstance) {
        throw new Error("DB not initialized");
    }

    _collection = dbInstance.collection("notes");
    return _collection;
}

async function createNote(content, parentType, parentId, createdAt){
    const notes = getCollection();
    const note = {
        content: content,
        parentType: parentType,
        parentId: parentId,
        createdAt: createdAt
    }

    return await notes.insertOne(note);
}

// find one note
async function findNote(searchQueryObject){
    const notes = getCollection();
    const results = await notes.find(searchQueryObject);
    return results[0] || null;
}

// find all notes
async function findNotes(searchQueryObject){
    const notes = getCollection();
    return await notes.find(searchQueryObject);
}

module.exports = {
    createNote,
    findNote,
    findNotes
}