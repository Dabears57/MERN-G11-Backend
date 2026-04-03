const db = require("../utils/mongo-utils");
const { ObjectId } = require("mongodb");

const DATABASE_STR = "development"
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
async function init(){
    // enforces one active session per user
    const sessions = await getCollection();
    await sessions.createIndex(
    { userId: 1 },
    {
        name: "unique_active_session_per_user",
        unique: true,
        partialFilterExpression: { active: true }
    }
    );
}

// create session and ensure it is the only active one
async function createSession(userId, sessionData) {
  try {
    await getCollection().insertOne({
      userId,
      active: true,
      ...sessionData,
      createdAt: new Date()
    });
    return { created: true };
  } catch (err) {
    if (err.code === 11000) {
      // duplicate key → active session already exists
      return { created: false };
    }
    throw err;
  }
}

async function fetchAndUpdateActiveSession(userId) {
  const result = await getCollection().findOneAndUpdate(
    { userId, active: true }, // only require active
    [
      {
        $set: {
          totalTime: {
            $cond: [
              { $eq: ["$paused", false] }, // only update if NOT paused
              {
                $add: [
                  { $ifNull: ["$totalTime", 0] },
                  { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } } // ms → sec
                ]
              },
              "$totalTime" // otherwise leave unchanged
            ]
          },
          currentTime: {
            $cond: [
              { $eq: ["$paused", false] },
              "$$NOW",
              "$currentTime"
            ]
          }
        }
      }
    ],
    { returnDocument: "after" }
  );

  return result.value;
}

async function pauseSession(userId) {
  const result = await getCollection().findOneAndUpdate(
    { userId, active: true, paused: false }, // only active & currently unpaused
    [
      {
        $set: {
          paused: true, // mark as paused
          totalTime: {
            $add: [
              { $ifNull: ["$totalTime", 0] },
              { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } } // ms → sec
            ]
          },
          currentTime: "$$NOW" // reset to pause time
        }
      }
    ],
    { returnDocument: "after" }
  );

  return result.value;
}

async function resumeSession(userId) {
  const result = await getCollection().findOneAndUpdate(
    { userId, active: true }, // always fetch active session
    [
      {
        $set: {
          paused: false, // unpause
          currentTime: "$$NOW", // reset start point
          // leave totalTime unchanged
        }
      }
    ],
    { returnDocument: "after" }
  );

  console.log(result)

  return result.value;
}

async function resumeSession(userId) {
  const result = await getCollection().findOneAndUpdate(
    { userId, active: true }, // always fetch active session
    [
      {
        $set: {
          paused: false, // unpause
          currentTime: "$$NOW", // reset start point
          // leave totalTime unchanged
        }
      }
    ],
    { returnDocument: "after" }
  );

  return result.value;
}

async function stopSession(userId) {
  const result = await getCollection().findOneAndUpdate(
    { userId, active: true }, // only active sessions
    [
      {
        $set: {
          active: false, // mark as stopped
          paused: true,  // mark as paused
          totalTime: {
            $cond: [
              { $eq: ["$paused", false] }, // only update if not paused
              {
                $add: [
                  { $ifNull: ["$totalTime", 0] },
                  { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } } // ms → sec
                ]
              },
              "$totalTime" // otherwise leave unchanged
            ]
          },
          currentTime: "$$NOW", // set to stop time
          endTime: "$$NOW"      // record when the session ended
        }
      }
    ],
    { returnDocument: "after" }
  );

  return result.value;
}

// CREATE
// async function createSession(session){
//     return await getCollection().insertOne(session);
// }

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

async function findActiveSession(userId){
    return await getCollection().findOne({
        userId: userId,
        active: true
    });
}


module.exports = {
    createSession,
    findSession,
    findSessions,
    updateSession,
    deleteSession,


    findActiveSession,
    fetchAndUpdateActiveSession,
    resumeSession,
    pauseSession,
    stopSession,
    init
};