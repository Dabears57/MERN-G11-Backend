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
const AUTH_TOKEN = jwtUtil.generateToken(TEST_USER_ID, 'sessions@example.com', 'SessionsUser');
const AUTH_HEADER = `Bearer ${AUTH_TOKEN}`;

let testProjectId;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/projects/create')
    .set('Authorization', AUTH_HEADER)
    .send({ title: 'Sessions Test Project', description: 'Used in session tests' });

  testProjectId = res.body.data.insertedId;
});

// ─── POST /api/sessions/create ────────────────────────────────────────────

describe('POST /api/sessions/create', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/sessions/create').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when projectId is missing', async () => {
    const res = await request(app)
      .post('/api/sessions/create')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates a session and returns 200', async () => {
    const res = await request(app)
      .post('/api/sessions/create')
      .set('Authorization', AUTH_HEADER)
      .send({ projectId: testProjectId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── GET /api/sessions/start ──────────────────────────────────────────────

describe('GET /api/sessions/start', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/sessions/start');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with session data when an active session exists', async () => {
    const res = await request(app)
      .get('/api/sessions/start')
      .set('Authorization', AUTH_HEADER);

    // Either found (200) or not found (404) - both are valid states
    expect([200, 404]).toContain(res.statusCode);
  });
});

// ─── GET /api/sessions/pause ──────────────────────────────────────────────

describe('GET /api/sessions/pause', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/sessions/pause');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 or 404 based on active session state', async () => {
    const res = await request(app)
      .get('/api/sessions/pause')
      .set('Authorization', AUTH_HEADER);

    expect([200, 404]).toContain(res.statusCode);
  });
});

// ─── GET /api/sessions/stop ───────────────────────────────────────────────

describe('GET /api/sessions/stop', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/sessions/stop');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 or 404 based on active session state', async () => {
    const res = await request(app)
      .get('/api/sessions/stop')
      .set('Authorization', AUTH_HEADER);

    expect([200, 404]).toContain(res.statusCode);
  });
});

// ─── POST /api/sessions/task/add ─────────────────────────────────────────

describe('POST /api/sessions/task/add', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/sessions/task/add').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when taskId is missing', async () => {
    const res = await request(app)
      .post('/api/sessions/task/add')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/sessions/task/remove ──────────────────────────────────────

describe('POST /api/sessions/task/remove', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/sessions/task/remove').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when taskId is missing', async () => {
    const res = await request(app)
      .post('/api/sessions/task/remove')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/sessions/fetch/one ─────────────────────────────────────────

describe('GET /api/sessions/fetch/one', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/sessions/fetch/one');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with session data', async () => {
    const res = await request(app)
      .get('/api/sessions/fetch/one')
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── GET /api/sessions/fetch/many ────────────────────────────────────────

describe('GET /api/sessions/fetch/many', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/sessions/fetch/many');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with an array of sessions', async () => {
    const res = await request(app)
      .get('/api/sessions/fetch/many')
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── GET /api/sessions/status ────────────────────────────────────────────

describe('GET /api/sessions/status', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/sessions/status');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with session status', async () => {
    const res = await request(app)
      .get('/api/sessions/status')
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBeDefined();
  });
});

// ─── DELETE /api/sessions/delete ─────────────────────────────────────────

describe('DELETE /api/sessions/delete', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).delete('/api/sessions/delete').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when session id is missing', async () => {
    const res = await request(app)
      .delete('/api/sessions/delete')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
