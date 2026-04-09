const db = require("../utils/mongo-utils");
const { ObjectId } = require("mongodb");
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

async function createNote(userId, content, parentType, parentId, createdAt){
    const notes = getCollection();
    const note = {
        userId: userId,
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
    const result = await notes.findOne(searchQueryObject);
    return result || null;
}

// find all notes
async function findNotes(searchQueryObject){
    const notes = getCollection();
    return await notes.find(searchQueryObject).toArray();
}

async function findParentTypes(){
    const notes = getCollection();
    const res = await notes.findOne({ lookup: "parentLookUp" });
    return res.parentTypes;
}

async function deleteNote(reqid, userId){
    const notes = getCollection(); // get your collection

    // Delete one document where both userId and _id match
    const result = await notes.deleteOne({
        _id: new ObjectId(reqid), 
        userId: userId
    });
    if(!result){
        throw new Error("unkown result unexpect null in model delete");
    }

    return result.deletedCount;
}

async function updateNote(userId, id, update){
    return await getCollection().updateOne(
        { _id: id, userId: userId },
        { $set: update }
    );
}

module.exports = {
    createNote,
    findNote,
    findNotes,
    findParentTypes,
    deleteNote,
    updateNote
}