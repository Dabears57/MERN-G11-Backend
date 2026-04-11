const request = require('supertest');
const createApp = require('./create-app');
const jwtUtil = require('../utils/jwt-utils');
const { ObjectId } = require('mongodb');

jest.mock('../utils/email-utils', () => ({
  userSendAccountVerificationEmail: jest.fn().mockResolvedValue(undefined),
  userSendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

const app = createApp();

const TEST_USER_ID = new ObjectId().toString();
const AUTH_TOKEN = jwtUtil.generateToken(TEST_USER_ID, 'tasks@example.com', 'TasksUser');
const AUTH_HEADER = `Bearer ${AUTH_TOKEN}`;

// Create a project once for all task tests
let testProjectId;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/projects/create')
    .set('Authorization', AUTH_HEADER)
    .send({ title: 'Task Test Project', description: 'Used in task tests' });

  testProjectId = res.body.data.insertedId;
});

// ─── POST /api/tasks/create ───────────────────────────────────────────────

describe('POST /api/tasks/create', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/tasks/create').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/tasks/create')
      .set('Authorization', AUTH_HEADER)
      .send({ projectId: testProjectId }); // missing name

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates a task and returns 200 with the task document', async () => {
    const res = await request(app)
      .post('/api/tasks/create')
      .set('Authorization', AUTH_HEADER)
      .send({ projectId: testProjectId, name: 'My Task', description: 'task desc' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});

// ─── POST /api/tasks/fetch/one ────────────────────────────────────────────

describe('POST /api/tasks/fetch/one', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/tasks/fetch/one').send({});
    expect(res.statusCode).toBe(401);
  });

  it('fetches a task by name and returns 200', async () => {
    await request(app)
      .post('/api/tasks/create')
      .set('Authorization', AUTH_HEADER)
      .send({ projectId: testProjectId, name: 'FetchOneTask' });

    const res = await request(app)
      .post('/api/tasks/fetch/one')
      .set('Authorization', AUTH_HEADER)
      .send({ name: 'FetchOneTask' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── POST /api/tasks/fetch/many ───────────────────────────────────────────

describe('POST /api/tasks/fetch/many', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/tasks/fetch/many').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with an array of tasks', async () => {
    const res = await request(app)
      .post('/api/tasks/fetch/many')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── PUT /api/tasks/update ────────────────────────────────────────────────

describe('PUT /api/tasks/update', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).put('/api/tasks/update').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when id or update object is missing', async () => {
    const res = await request(app)
      .put('/api/tasks/update')
      .set('Authorization', AUTH_HEADER)
      .send({ name: 'no id or update' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('updates a task and returns 200', async () => {
    const createRes = await request(app)
      .post('/api/tasks/create')
      .set('Authorization', AUTH_HEADER)
      .send({ projectId: testProjectId, name: 'UpdateMe' });

    const taskId = createRes.body.data._id;

    const res = await request(app)
      .put('/api/tasks/update')
      .set('Authorization', AUTH_HEADER)
      .send({ id: taskId, update: { name: 'Updated Task Name' } });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── DELETE /api/tasks/delete ────────────────────────────────────────────

describe('DELETE /api/tasks/delete', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).delete('/api/tasks/delete').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when task id is missing', async () => {
    const res = await request(app)
      .delete('/api/tasks/delete')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('deletes a task and returns 200', async () => {
    const createRes = await request(app)
      .post('/api/tasks/create')
      .set('Authorization', AUTH_HEADER)
      .send({ projectId: testProjectId, name: 'DeleteMe' });

    const taskId = createRes.body.data._id;

    const res = await request(app)
      .delete('/api/tasks/delete')
      .set('Authorization', AUTH_HEADER)
      .send({ id: taskId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
