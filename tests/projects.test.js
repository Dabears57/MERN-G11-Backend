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

// Generate a token for a fake test user
const TEST_USER_ID = new ObjectId().toString();
const AUTH_TOKEN = jwtUtil.generateToken(TEST_USER_ID, 'projects@example.com', 'ProjectsUser');
const AUTH_HEADER = `Bearer ${AUTH_TOKEN}`;

// ─── POST /api/projects/create ─────────────────────────────────────────────

describe('POST /api/projects/create', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/projects/create').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/projects/create')
      .set('Authorization', AUTH_HEADER)
      .send({ title: 'Only Title' }); // missing description

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates a project and returns 200', async () => {
    const res = await request(app)
      .post('/api/projects/create')
      .set('Authorization', AUTH_HEADER)
      .send({ title: 'Test Project', description: 'A test project' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});

// ─── POST /api/projects/fetch/one ─────────────────────────────────────────

describe('POST /api/projects/fetch/one', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/projects/fetch/one').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with null data for a non-existent project', async () => {
    const res = await request(app)
      .post('/api/projects/fetch/one')
      .set('Authorization', AUTH_HEADER)
      .send({ title: 'nonexistent' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('fetches an existing project', async () => {
    // Create a project first
    await request(app)
      .post('/api/projects/create')
      .set('Authorization', AUTH_HEADER)
      .send({ title: 'Fetch One Project', description: 'desc' });

    const res = await request(app)
      .post('/api/projects/fetch/one')
      .set('Authorization', AUTH_HEADER)
      .send({ title: 'Fetch One Project' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── POST /api/projects/fetch/many ────────────────────────────────────────

describe('POST /api/projects/fetch/many', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/projects/fetch/many').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with an array of projects', async () => {
    const res = await request(app)
      .post('/api/projects/fetch/many')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── PUT /api/projects/update ──────────────────────────────────────────────

describe('PUT /api/projects/update', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).put('/api/projects/update').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when id or update object is missing', async () => {
    const res = await request(app)
      .put('/api/projects/update')
      .set('Authorization', AUTH_HEADER)
      .send({ title: 'missing id' }); // no id or update field

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when trying to update protected fields (userId, _id)', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .put('/api/projects/update')
      .set('Authorization', AUTH_HEADER)
      .send({ id: fakeId, update: { userId: 'hacker' } });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('updates a project and returns 200', async () => {
    const createRes = await request(app)
      .post('/api/projects/create')
      .set('Authorization', AUTH_HEADER)
      .send({ title: 'Update Me', description: 'original' });

    const projectId = createRes.body.data.insertedId;

    const res = await request(app)
      .put('/api/projects/update')
      .set('Authorization', AUTH_HEADER)
      .send({ id: projectId, update: { title: 'Updated Title' } });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── DELETE /api/projects/delete ──────────────────────────────────────────

describe('DELETE /api/projects/delete', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).delete('/api/projects/delete').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when project id is missing', async () => {
    const res = await request(app)
      .delete('/api/projects/delete')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('deletes a project and returns 200', async () => {
    const createRes = await request(app)
      .post('/api/projects/create')
      .set('Authorization', AUTH_HEADER)
      .send({ title: 'Delete Me', description: 'to be deleted' });

    const projectId = createRes.body.data.insertedId;

    const res = await request(app)
      .delete('/api/projects/delete')
      .set('Authorization', AUTH_HEADER)
      .send({ id: projectId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
