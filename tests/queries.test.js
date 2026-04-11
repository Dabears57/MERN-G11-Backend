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
const AUTH_TOKEN = jwtUtil.generateToken(TEST_USER_ID, 'queries@example.com', 'QueriesUser');
const AUTH_HEADER = `Bearer ${AUTH_TOKEN}`;

// ─── GET /api/queries/projects ────────────────────────────────────────────

describe('GET /api/queries/projects', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/queries/projects');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with an array of project metadata', async () => {
    const res = await request(app)
      .get('/api/queries/projects')
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── GET /api/queries/sessions ────────────────────────────────────────────

describe('GET /api/queries/sessions', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/queries/sessions');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with an array of session metadata', async () => {
    const res = await request(app)
      .get('/api/queries/sessions')
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── GET /api/queries/tasks ───────────────────────────────────────────────

describe('GET /api/queries/tasks', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/queries/tasks');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with an array of task metadata', async () => {
    const res = await request(app)
      .get('/api/queries/tasks')
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── GET /api/queries/project/:id ─────────────────────────────────────────

describe('GET /api/queries/project/:id', () => {
  it('returns 401 when no auth token is provided', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app).get(`/api/queries/project/${fakeId}`);
    expect(res.statusCode).toBe(401);
  });

  it('returns 404 for a non-existent project id', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .get(`/api/queries/project/${fakeId}`)
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 200 with full project data for an existing project', async () => {
    const createRes = await request(app)
      .post('/api/projects/create')
      .set('Authorization', AUTH_HEADER)
      .send({ title: 'Query Project', description: 'for query test' });

    const projectId = createRes.body.data.insertedId;

    const res = await request(app)
      .get(`/api/queries/project/${projectId}`)
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});

// ─── GET /api/queries/session/:id ─────────────────────────────────────────

describe('GET /api/queries/session/:id', () => {
  it('returns 401 when no auth token is provided', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app).get(`/api/queries/session/${fakeId}`);
    expect(res.statusCode).toBe(401);
  });

  it('returns 404 for a non-existent session id', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .get(`/api/queries/session/${fakeId}`)
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
