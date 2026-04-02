const db = require("../utils/mongo-utils");

let _collection = null;

function getCollection() {
    if (_collection) return _collection;

    const dbInstance = db.getDb(DATABASE_STR);

    if (!dbInstance) {
        throw new Error("DB not initialized");
    }

    _collection = dbInstance.collection("tasks");
    return _collection;
}

// CREATE
async function createTask(task){
    return await getCollection().insertOne(task);
}

// FIND ONE
async function findTask(query){
    return await getCollection().findOne(query);
}

// FIND MANY
async function findTasks(query){
    return await getCollection().find(query).toArray();
}

// UPDATE
async function updateTask(id, update){
    return await getCollection().updateOne(
        { _id: id },
        { $set: update }
    );
}

// DELETE
async function deleteTask(id){
    return await getCollection().deleteOne({ _id: id });
}

module.exports = {
    createTask,
    findTask,
    findTasks,
    updateTask,
    deleteTask
};