const db = require("../utils/mongo-utils");

let _collection = null;

function getCollection() {
    if (_collection) return _collection;

    const dbInstance = db.getDb(DATABASE_STR);

    if (!dbInstance) {
        throw new Error("DB not initialized");
    }

    _collection = dbInstance.collection("sessions");
    return _collection;
}

// CREATE
async function createSession(session){
    return await getCollection().insertOne(session);
}

// FIND ONE
async function findSession(query){
    return await getCollection().findOne(query);
}

// FIND MANY
async function findSessions(query){
    return await getCollection().find(query).toArray();
}

// UPDATE
async function updateSession(id, update){
    return await getCollection().updateOne(
        { _id: id },
        { $set: update }
    );
}

// DELETE
async function deleteSession(id){
    return await getCollection().deleteOne({ _id: id });
}

module.exports = {
    createSession,
    findSession,
    findSessions,
    updateSession,
    deleteSession
};