// services/queries.js

const { getCollectionGeneral } = require("../utils/mongo-utils");

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
  const notes = await notesCol.find({ projectId }).toArray();

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
      const task = await tasksCol.findOne({ _id: t.taskId });
      return {
        _id: t.taskId,
        name: task?.name || "Unknown",
        timeSpent: t.totalTime|| 0
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
        name: p.name,
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
      const project = await projectsCol.findOne({ _id: t.projectId });

      const sessions = await sessionsCol.find({
        "tasks.taskId": t._id
      }).toArray();

      let totalTime = 0;

      for (const s of sessions) {
        const taskEntry = s.tasks.find(x => x.taskId === t._id);
        if (taskEntry) totalTime += taskEntry.totalTime || 0;
      }

      return {
        _id: t._id,
        name: t.name,
        projectName: project?.name || "Unknown",
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
    const project = await projectsCol.findOne({ _id: projectId });
    const projectSessions = projectSessionsMap[projectId];

    // sort by startDate
    projectSessions.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    projectSessions.forEach((s, index) => {
      result.push({
        _id: s._id,
        name: `${project?.name || "Unknown"}: Session #${index + 1}`,
        startDate: s.startDate,
        endDate: s.endDate,
        projectName: project?.name || "Unknown"
      });
    });
  }

  // global sort
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