const db = require("../utils/mongo-utils");
const DATABASE_STR = "development";


let _collection = null;

function getCollection() {
    if (_collection) return _collection;

    const dbInstance = db.getDb(DATABASE_STR);

    if (!dbInstance) {
        throw new Error("DB not initialized");
    }

    _collection = dbInstance.collection("projects");
    return _collection;
}

// increment total projet time
async function incrementTotalTime(projectId, timeInSeconds) {
  return await getCollection().updateOne(
    { _id: new Object(projectId) },
    { $inc: { totalTime: timeInSeconds } }
  );
}

// CREATE
async function createProject(project){
    return await getCollection().insertOne(project);
}

// FIND ONE
async function findProject(query){
    return await getCollection().findOne(query);
}

// FIND MANY
async function findProjects(query){
    return await getCollection().find(query).toArray();
}

// UPDATE
async function updateProject(id, update){
    return await getCollection().updateOne(
        { _id: id },
        { $set: update }
    );
}

// DELETE
async function deleteProject(id){
    return await getCollection().deleteOne({ _id: id });
}

module.exports = {
    createProject,
    findProject,
    findProjects,
    updateProject,
    deleteProject,
    incrementTotalTime
};