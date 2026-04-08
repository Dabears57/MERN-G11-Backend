// services/queries.js

const { getCollectionGeneral } = require("../utils/mongo-utils");
const { ObjectId } = require("mongodb"); // needed for casting string IDs to ObjectId

// TODO: update to ensure only users can fetch THEIR DATA

async function getFullProject(projectId) {
  const projects = getCollectionGeneral("projects");
  const tasksCol = getCollectionGeneral("tasks");
  const sessionsCol = getCollectionGeneral("sessions");
  const notesCol = getCollectionGeneral("notes");

  const project = await projects.findOne({ _id: projectId });
  if (!project) return null;

  const tasks = await tasksCol.find({ projectId }).toArray();
  const sessions = await sessionsCol.find({ projectId }).toArray();

  // FIX: notes are stored with parentType/parentId, not projectId.
  // parentId is stored as a plain string (the client sends a string), so we
  // must compare against string versions of the ObjectIds, not ObjectId objects.
  const taskIdStrings = tasks.map(t => t._id.toString());
  const notes = await notesCol.find({
    $or: [
      { parentType: "project", parentId: projectId.toString() },
      { parentType: "task",    parentId: { $in: taskIdStrings } }
    ]
  }).toArray();

  return {
    project,
    tasks,
    sessions,
    notes
  };
}

async function getFullSession(sessionId) {
  const sessionsCol = getCollectionGeneral("sessions");
  const tasksCol = getCollectionGeneral("tasks");
  const projectsCol = getCollectionGeneral("projects");

  const session = await sessionsCol.findOne({ _id: sessionId });
  if (!session) return null;

  const project = await projectsCol.findOne({ _id: session.projectId });

  const tasks = session.tasks || [];

  // tasks assumed like:
  // [{ taskId, duration }]

  const enrichedTasks = await Promise.all(
    tasks.map(async (t) => {
      // FIX: taskId is stored as a string (from req.body), but _id is ObjectId.
      // Cast to ObjectId so findOne actually matches the task document.
      const task = await tasksCol.findOne({ _id: new ObjectId(t.taskId) });
      return {
        _id: t.taskId,
        name: task?.name || "Unknown",
        timeSpent: t.totalTime || 0
      };
    })
  );

  return {
    session,
    project,
    tasks: enrichedTasks
  };
}

async function listProjectMetadata(userId) {
  const projectsCol = getCollectionGeneral("projects");
  const sessionsCol = getCollectionGeneral("sessions");

  const projects = await projectsCol.find({ userId }).toArray();

  const result = await Promise.all(
    projects.map(async (p) => {
      const sessions = await sessionsCol.find({ projectId: p._id }).toArray();

      const totalTime = sessions.reduce((acc, s) => acc + (s.totalTime|| 0), 0);

      return {
        _id: p._id,
        name: p.title,
        startDate: p.startDate,
        endDate: p.endDate,
        totalTime
      };
    })
  );

  return result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

async function listTaskMetadata(userId) {
  const tasksCol = getCollectionGeneral("tasks");
  const sessionsCol = getCollectionGeneral("sessions");
  const projectsCol = getCollectionGeneral("projects");

  const tasks = await tasksCol.find({ userId }).toArray();

  const result = await Promise.all(
    tasks.map(async (t) => {
      // FIX: projectId is stored as a string on tasks (client-sent), so cast to
      // ObjectId before querying — otherwise findOne never matches.
      const project = await projectsCol.findOne({ _id: new ObjectId(t.projectId) });

      // FIX: session.tasks[].taskId is stored as a string (client-sent), so
      // compare against t._id.toString() in both the DB query and the in-memory find.
      const sessions = await sessionsCol.find({
        "tasks.taskId": t._id.toString()
      }).toArray();

      let totalTime = 0;

      for (const s of sessions) {
        const taskEntry = s.tasks.find(x => x.taskId === t._id.toString());
        if (taskEntry) totalTime += taskEntry.totalTime || 0;
      }

      return {
        _id: t._id,
        name: t.name,
        projectName: project?.title || "Unknown",
        totalTime,
        startDate: t.startDate,
        endDate: t.endDate
      };
    })
  );

  return result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

async function listSessionMetadata(userId) {
  const sessionsCol = getCollectionGeneral("sessions");
  const projectsCol = getCollectionGeneral("projects");

  const sessions = await sessionsCol.find({ userId }).toArray();

  // group sessions by project
  const projectSessionsMap = {};

  for (const s of sessions) {
    if (!projectSessionsMap[s.projectId]) {
      projectSessionsMap[s.projectId] = [];
    }
    projectSessionsMap[s.projectId].push(s);
  }

  const result = [];

  for (const projectId in projectSessionsMap) {
    // FIX: for...in yields string keys; cast back to ObjectId so findOne matches the _id field.
    const project = await projectsCol.findOne({ _id: new ObjectId(projectId) });
    const projectSessions = projectSessionsMap[projectId];

    // FIX: sessions have no startDate field — they use createdAt (set at insert time).
    projectSessions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    projectSessions.forEach((s, index) => {
      result.push({
        _id: s._id,
        name: `${project?.title || "Unknown"}: Session #${index + 1}`,
        // FIX: sessions store createdAt (start) and endTime (stop), not startDate/endDate.
        startDate: s.startDate || s.createdAt,
        endDate:   s.endDate   || s.endTime,
        projectName: project?.title || "Unknown"
      });
    });
  }

  // global sort by start time
  result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return result;
}

module.exports = {
    listProjectMetadata,
    listTaskMetadata,
    getFullSession,
    getFullProject,
    listSessionMetadata
}