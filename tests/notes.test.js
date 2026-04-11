const request = require('supertest');
const createApp = require('./create-app');
const jwtUtil = require('../utils/jwt-utils');
const { ObjectId } = require('mongodb');
const mongoUtils = require('../utils/mongo-utils');

jest.mock('../utils/email-utils', () => ({
  userSendAccountVerificationEmail: jest.fn().mockResolvedValue(undefined),
  userSendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

const app = createApp();

const TEST_USER_ID = new ObjectId().toString();
const AUTH_TOKEN = jwtUtil.generateToken(TEST_USER_ID, 'notes@example.com', 'NotesUser');
const AUTH_HEADER = `Bearer ${AUTH_TOKEN}`;

// Seed the parentTypes lookup document that noteService.findParentTypes() needs
beforeAll(async () => {
  const db = mongoUtils.getDb('development');
  const notes = db.collection('notes');
  await notes.deleteOne({ lookup: 'parentLookUp' });
  await notes.insertOne({ lookup: 'parentLookUp', parentTypes: ['project', 'session', 'task'] });
});

// ─── POST /api/notes/create ───────────────────────────────────────────────

describe('POST /api/notes/create', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/notes/create').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/notes/create')
      .set('Authorization', AUTH_HEADER)
      .send({ content: 'some note' }); // missing parentType and parentId

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates a note and returns 200', async () => {
    const fakeParentId = new ObjectId().toString();
    const res = await request(app)
      .post('/api/notes/create')
      .set('Authorization', AUTH_HEADER)
      .send({ content: 'Test note content', parentType: 'project', parentId: fakeParentId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── POST /api/notes/fetch/one ────────────────────────────────────────────

describe('POST /api/notes/fetch/one', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/notes/fetch/one').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with a note document', async () => {
    const fakeParentId = new ObjectId().toString();
    await request(app)
      .post('/api/notes/create')
      .set('Authorization', AUTH_HEADER)
      .send({ content: 'FetchOne Note', parentType: 'project', parentId: fakeParentId });

    const res = await request(app)
      .post('/api/notes/fetch/one')
      .set('Authorization', AUTH_HEADER)
      .send({ content: 'FetchOne Note' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── POST /api/notes/fetch/many ───────────────────────────────────────────

describe('POST /api/notes/fetch/many', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/notes/fetch/many').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with an array of notes', async () => {
    const res = await request(app)
      .post('/api/notes/fetch/many')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── DELETE /api/notes/delete ─────────────────────────────────────────────

describe('DELETE /api/notes/delete', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).delete('/api/notes/delete').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when note id is missing', async () => {
    const res = await request(app)
      .delete('/api/notes/delete')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 404 when the note does not exist', async () => {
    const res = await request(app)
      .delete('/api/notes/delete')
      .set('Authorization', AUTH_HEADER)
      .send({ id: new ObjectId().toString() });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('deletes a note and returns 200', async () => {
    const fakeParentId = new ObjectId().toString();
    const createRes = await request(app)
      .post('/api/notes/create')
      .set('Authorization', AUTH_HEADER)
      .send({ content: 'Delete this note', parentType: 'project', parentId: fakeParentId });

    const noteId = createRes.body.data.insertedId;

    const res = await request(app)
      .delete('/api/notes/delete')
      .set('Authorization', AUTH_HEADER)
      .send({ id: noteId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── GET /api/notes/fetch/types ───────────────────────────────────────────

describe('GET /api/notes/fetch/types', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/notes/fetch/types');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with an array of valid parent types', async () => {
    const res = await request(app)
      .get('/api/notes/fetch/types')
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── PUT /api/notes/edit ──────────────────────────────────────────────────

describe('PUT /api/notes/edit', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).put('/api/notes/edit').send({});
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when noteId or content is missing', async () => {
    const res = await request(app)
      .put('/api/notes/edit')
      .set('Authorization', AUTH_HEADER)
      .send({ noteId: new ObjectId().toString() }); // missing content

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 200 when editing a note', async () => {
    const fakeParentId = new ObjectId().toString();
    const createRes = await request(app)
      .post('/api/notes/create')
      .set('Authorization', AUTH_HEADER)
      .send({ content: 'Original content', parentType: 'project', parentId: fakeParentId });

    const noteId = createRes.body.data.insertedId;

    const res = await request(app)
      .put('/api/notes/edit')
      .set('Authorization', AUTH_HEADER)
      .send({ noteId, content: 'Updated content' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
