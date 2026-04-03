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

function getCollectionGeneral(collection){
    const dbInstance = db.getDb(DATABASE_STR);

    if (!dbInstance) {
        throw new Error("DB not initialized");
    }

    return dbInstance.collection(collection)
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

// async function fetchAndUpdateActiveSession(userId) {
//   const result = await getCollection().findOneAndUpdate(
//     { userId, active: true }, // only require active
//     [
//       {
//         $set: {
//           totalTime: {
//             $cond: [
//               { $eq: ["$paused", false] }, // only update if NOT paused
//               {
//                 $add: [
//                   { $ifNull: ["$totalTime", 0] },
//                   { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } } // ms → sec
//                 ]
//               },
//               "$totalTime" // otherwise leave unchanged
//             ]
//           },
//           currentTime: {
//             $cond: [
//               { $eq: ["$paused", false] },
//               "$$NOW",
//               "$currentTime"
//             ]
//           }
//         }
//       }
//     ],
//     { returnDocument: "after" }
//   );

//   return result.value;
// }

// async function pauseSession(userId) {
//   const result = await getCollection().findOneAndUpdate(
//     { userId, active: true, paused: false }, // only active & currently unpaused
//     [
//       {
//         $set: {
//           paused: true, // mark as paused
//           totalTime: {
//             $add: [
//               { $ifNull: ["$totalTime", 0] },
//               { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } } // ms → sec
//             ]
//           },
//           currentTime: "$$NOW" // reset to pause time
//         }
//       }
//     ],
//     { returnDocument: "after" }
//   );

//   return result.value;
// }

// async function resumeSession(userId) {
//   const result = await getCollection().findOneAndUpdate(
//     { userId, active: true }, // always fetch active session
//     [
//       {
//         $set: {
//           paused: false, // unpause
//           currentTime: "$$NOW", // reset start point
//           // leave totalTime unchanged
//         }
//       }
//     ],
//     { returnDocument: "after" }
//   );

//   return result.value;
// }

// async function stopSession(userId) {
//   const result = await getCollection().findOneAndUpdate(
//     { userId, active: true }, // only active sessions
//     [
//       {
//         $set: {
//           active: false, // mark as stopped
//           paused: true,  // mark as paused
//           totalTime: {
//             $cond: [
//               { $eq: ["$paused", false] }, // only update if not paused
//               {
//                 $add: [
//                   { $ifNull: ["$totalTime", 0] },
//                   { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } } // ms → sec
//                 ]
//               },
//               "$totalTime" // otherwise leave unchanged
//             ]
//           },
//           currentTime: "$$NOW", // set to stop time
//           endTime: "$$NOW"      // record when the session ended
//         }
//       }
//     ],
//     { returnDocument: "after" }
//   );

//   return result.value;
// }
async function markInactive(sessionId) {
  return await getCollection().updateOne(
    { _id: sessionId },
    { $set: { active: false } }
  );
}

async function pauseSession(userId) {
  const result = await getCollection().findOneAndUpdate(
    { userId, active: true, paused: false }, // only active & currently unpaused
    [
      {
        $set: {
          paused: true, // mark session as paused
          totalTime: {
            $add: [
              { $ifNull: ["$totalTime", 0] },
              { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } } // ms → sec
            ]
          },
          currentTime: "$$NOW",
          tasks: {
            $map: {
              input: "$tasks",
              as: "t",
              in: {
                $mergeObjects: [
                  "$$t", // preserve all fields, including paused
                  {
                    totalTime: {
                      $cond: [
                        { $eq: ["$$t.paused", false] }, // only update if task is not paused
                        {
                          $add: [
                            { $ifNull: ["$$t.totalTime", 0] },
                            { $trunc: { $divide: [{ $subtract: ["$$NOW", "$$t.currentTime"] }, 1000] } }
                          ]
                        },
                        "$$t.totalTime" // leave unchanged if task is paused
                      ]
                    },
                    currentTime: {
                      $cond: [
                        { $eq: ["$$t.paused", false] },
                        "$$NOW",
                        "$$t.currentTime"
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ],
    { returnDocument: "after" }
  );

  return result.value;
}

async function resumeSession(userId) {
  const result = await getCollection().findOneAndUpdate(
    { userId, active: true }, // only active session
    [
      {
        $set: {
          paused: false, // unpause session
          currentTime: "$$NOW",
          tasks: {
            $map: {
              input: "$tasks",
              as: "t",
              in: {
                $mergeObjects: [
                  "$$t", // preserve all existing fields, including paused
                  {
                    currentTime: {
                      $cond: [
                        { $eq: ["$$t.paused", false] }, // only reset start time for unpaused tasks
                        "$$NOW",
                        "$$t.currentTime" // leave paused tasks unchanged
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ],
    { returnDocument: "after" }
  );

  return result.value;
}

// Update session totalTime and session.tasks local times atomically
// async function fetchAndUpdateActiveSession(userId) {
//   return await getCollectionGeneral("sessions").findOneAndUpdate(
//     { userId, active: true },
//     [
//       {
//         $set: {
//           totalTime: {
//             $cond: [
//               { $eq: ["$paused", false] },
//               { $add: ["$totalTime", { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } }] },
//               "$totalTime"
//             ]
//           },
//           currentTime: { $cond: [{ $eq: ["$paused", false] }, "$$NOW", "$currentTime"] },
//           tasks: {
//             $map: {
//               input: "$tasks",
//               as: "t",
//               in: {
//                 taskId: "$$t.taskId",
//                 totalTime: {
//                   $cond: [
//                     { $eq: ["$paused", false] },
//                     { $add: ["$$t.totalTime", { $trunc: { $divide: [{ $subtract: ["$$NOW", "$$t.currentTime"] }, 1000] } }] },
//                     "$$t.totalTime"
//                   ]
//                 },
//                 currentTime: { $cond: [{ $eq: ["$paused", false] }, "$$NOW", "$$t.currentTime"] }
//               }
//             }
//           }
//         }
//       }
//     ],
//     { returnDocument: "after" }
//   ).then(r => r.value);
// }

async function fetchAndUpdateActiveSession(userId) {
  return await getCollectionGeneral("sessions").findOneAndUpdate(
    { userId, active: true },
    [
      {
        $set: {
          totalTime: {
            $cond: [
              { $eq: ["$paused", false] },
              {
                $add: [
                  "$totalTime",
                  { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } }
                ]
              },
              "$totalTime"
            ]
          },
          currentTime: {
            $cond: [{ $eq: ["$paused", false] }, "$$NOW", "$currentTime"]
          },
          tasks: {
            $map: {
              input: "$tasks",
              as: "t",
              in: {
                $mergeObjects: [
                  "$$t", // keep all existing fields, including paused
                  {
                    totalTime: {
                      $cond: [
                        { $and: [{ $eq: ["$paused", false] }, { $eq: ["$$t.paused", false] }] },
                        { $add: ["$$t.totalTime", { $trunc: { $divide: [{ $subtract: ["$$NOW", "$$t.currentTime"] }, 1000] } }] },
                        "$$t.totalTime"
                      ]
                    },
                    currentTime: {
                      $cond: [
                        { $and: [{ $eq: ["$paused", false] }, { $eq: ["$$t.paused", false] }] },
                        "$$NOW",
                        "$$t.currentTime"
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ],
    { returnDocument: "after" }
  ).then(r => r.value);
}

async function stopAndUpdate(userId) {
  console.log("attempting update...");
  return await getCollectionGeneral("sessions").findOneAndUpdate(
    { userId, active: true },
    [
      {
        $set: {
          paused: true,
          endTime: "$$NOW",
          totalTime: {
            $cond: [
              { $eq: ["$paused", false] },
              { $add: [
                  { $ifNull: ["$totalTime", 0] },
                  { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } }
                ]
              },
              "$totalTime"
            ]
          },
          currentTime: { $cond: [{ $eq: ["$paused", false] }, "$$NOW", "$currentTime"] },
          tasks: {
            $map: {
              input: "$tasks",
              as: "t",
              in: {
                taskId: "$$t.taskId",
                totalTime: {
                  $cond: [
                    { $eq: ["$paused", false] },
                    { $add: [
                        { $ifNull: ["$$t.totalTime", 0] },
                        { $trunc: { $divide: [{ $subtract: ["$$NOW", "$$t.currentTime"] }, 1000] } }
                      ]
                    },
                    "$$t.totalTime"
                  ]
                },
                currentTime: { $cond: [{ $eq: ["$paused", false] }, "$$NOW", "$$t.currentTime"] }
              }
            }
          }
        }
      }
    ],
    { returnDocument: "after" }
  ).then(r => r.value);
}

async function modifySessionTask(sessionId, taskId, action) {
  const session = await getCollectionGeneral("sessions").findOne({ _id: sessionId });
  if (!session) return null;

  let tasks = session.tasks || [];
  const now = new Date();

  const taskIndex = tasks.findIndex(t => t.taskId.toString() === taskId.toString());

  if (action === "add") {
    if (taskIndex === -1) {
      // Task is new to session → schedule it
      tasks.push({ taskId, totalTime: 0, currentTime: now, paused: false});
    } else {
      // Task exists → reschedule it
      tasks[taskIndex].paused = false;
      tasks[taskIndex].currentTime = now; // reset timestamp to start tracking again
    }
  } else if (action === "remove") {
    if (taskIndex !== -1) {
      // Pause task from accruing further time
      if (!session.paused && !tasks[taskIndex].paused) {
        tasks[taskIndex].totalTime += Math.trunc((now - tasks[taskIndex].currentTime) / 1000);
      }
      tasks[taskIndex].paused = true; // mark as unscheduled
      // do not remove from array
    }
  }

  // Update session with modified tasks
  return await getCollectionGeneral("sessions").findOneAndUpdate(
    { _id: sessionId },
    { $set: { tasks } },
    { returnDocument: "after" }
  ).then(r => r.value);
}

// Stop session and commit local times
async function stopAndUpdate(userId) {
  return await getCollectionGeneral("sessions").findOneAndUpdate(
    { userId, active: true },
    [
      {
        $set: {
          paused: true,
          endTime: "$$NOW",
          totalTime: {
            $cond: [
              { $eq: ["$paused", false] }, // only add time if session was active
              { $add: [
                  { $ifNull: ["$totalTime", 0] },
                  { $trunc: { $divide: [{ $subtract: ["$$NOW", "$currentTime"] }, 1000] } } // ms → sec
                ]
              },
              "$totalTime"
            ]
          },
          currentTime: { $cond: [{ $eq: ["$paused", false] }, "$$NOW", "$currentTime"] },
          tasks: {
            $map: {
              input: { $ifNull: ["$tasks", []] }, // ensure array
              as: "t",
              in: {
                $mergeObjects: [
                  "$$t", // preserve all existing task fields
                  {
                    totalTime: {
                      $cond: [
                        { $eq: ["$$t.paused", false] }, // only add time if task is not paused
                        { $add: [
                            { $ifNull: ["$$t.totalTime", 0] },
                            { $trunc: { $divide: [{ $subtract: ["$$NOW", "$$t.currentTime"] }, 1000] } }
                          ]
                        },
                        "$$t.totalTime"
                      ]
                    },
                    currentTime: { $cond: [{ $eq: ["$$t.paused", false] }, "$$NOW", "$$t.currentTime"] },
                    paused: true // mark all tasks as paused when session stops
                  }
                ]
              }
            }
          }
        }
      }
    ],
    { returnDocument: "after" }
  ).then(r => r.value);
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
    init,

    fetchAndUpdateActiveSession,
    modifySessionTask,
    markInactive,
    stopAndUpdate
};