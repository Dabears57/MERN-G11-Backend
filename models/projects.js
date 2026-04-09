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

function getCollectionGeneral(collection){
    const dbInstance = db.getDb(DATABASE_STR);

    if (!dbInstance) {
        throw new Error("DB not initialized");
    }

    return dbInstance.collection(collection)
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
async function updateProject(userId, id, update){
    return await getCollection().updateOne(
        { _id: id, userId: userId },
        { $set: update }
    );
}

// DELETE
async function deleteProject(userId, id) {
    const projectId = id;

    const projectsCol = getCollectionGeneral("projects");
    const tasksCol = getCollectionGeneral("tasks");
    const sessionsCol = getCollectionGeneral("sessions");
    const notesCol = getCollectionGeneral("notes"); // assuming this exists

    const client = projectsCol.client;
    const session = client.startSession();

    try {
        await session.withTransaction(async () => {

            // 1. Ensure project exists (optional but good practice)
            const project = await projectsCol.findOne(
                { _id: projectId, userId: userId },
                { session }
            );

            if (!project) {
                throw new Error("Project not found");
            }

            // 2. Delete all sessions tied to project
            await sessionsCol.deleteMany(
                { projectId: projectId, userId: userId },
                { session }
            );

            // 3. Delete all tasks tied to project
            await tasksCol.deleteMany(
                { projectId: projectId, userId: userId },
                { session }
            );

            // 4. Delete all notes tied to project
            await notesCol.deleteMany(
                { parentId: projectId, userId: userId },
                { session }
            );

            // 5. Delete the project itself
            await projectsCol.deleteOne(
                { _id: projectId, userId: userId },
                { session }
            );

        });

    } finally {
        await session.endSession();
    }
}

module.exports = {
    createProject,
    findProject,
    findProjects,
    updateProject,
    deleteProject,
    incrementTotalTime
};