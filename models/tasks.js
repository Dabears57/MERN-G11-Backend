const db = require("../utils/mongo-utils");
const DATABASE_STR = "development";

const { ObjectId } = require("mongodb");

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

// update task time
async function incrementTotalTime(taskId, timeInSeconds) {
  return await getCollection().updateOne(
    { _id: new ObjectId(taskId) },
    { $inc: { totalTime: timeInSeconds } }
  );
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
async function updateTask(userId, id, update){
    return await getCollection().updateOne(
        { 
            _id: id,
            userId: userId
        },
        { $set: update }
    );
}

// DELETE
async function deleteTask(userId, id){
    return await getCollection().deleteOne({ 
        _id: id,
        userId: userId
    });
}

module.exports = {
    createTask,
    findTask,
    findTasks,
    updateTask,
    deleteTask,
   incrementTotalTime 
};