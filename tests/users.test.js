const request = require('supertest');
const createApp = require('./create-app');

// Prevent real emails from being sent during tests
jest.mock('../utils/email-utils', () => ({
  userSendAccountVerificationEmail: jest.fn().mockResolvedValue(undefined),
  userSendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

const app = createApp();

// ─── POST /api/users/create ────────────────────────────────────────────────

describe('POST /api/users/create', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users/create')
      .send({ email: 'test@example.com' }); // missing password and firstName

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates a new user and returns 200 with a verification link', async () => {
    const res = await request(app)
      .post('/api/users/create')
      .send({ email: 'newuser@example.com', password: 'password123', firstName: 'Test' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.link).toBeDefined();
  });

  it('returns 400 when the same email is registered twice', async () => {
    const payload = { email: 'duplicate@example.com', password: 'pass', firstName: 'Dup' };
    await request(app).post('/api/users/create').send(payload);

    const res = await request(app).post('/api/users/create').send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/users/verify ────────────────────────────────────────────────

describe('GET /api/users/verify', () => {
  it('returns 400 when no token is provided', async () => {
    const res = await request(app).get('/api/users/verify');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for an invalid/expired token', async () => {
    const res = await request(app).get('/api/users/verify?token=invalidtoken123');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('verifies an account with a valid token', async () => {
    // Create a user and extract the raw token from the link
    const createRes = await request(app)
      .post('/api/users/create')
      .send({ email: 'verify@example.com', password: 'pass', firstName: 'Verify' });

    const link = createRes.body.data.link;
    const token = new URL(link).searchParams.get('token');

    const res = await request(app).get(`/api/users/verify?token=${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── POST /api/users/login ────────────────────────────────────────────────

describe('POST /api/users/login', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'someone@example.com' }); // missing password

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns a JWT on successful login', async () => {
    // Register + verify a fresh user, then log in
    const email = 'logintest@example.com';
    const password = 'secret';

    const createRes = await request(app)
      .post('/api/users/create')
      .send({ email, password, firstName: 'Login' });

    const token = new URL(createRes.body.data.link).searchParams.get('token');
    await request(app).get(`/api/users/verify?token=${token}`);

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email, password });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeDefined();
  });
});

// ─── POST /api/users/verify/regen ─────────────────────────────────────────

describe('POST /api/users/verify/regen', () => {
  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/users/verify/regen').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 404 for a non-existent user', async () => {
    const res = await request(app)
      .post('/api/users/verify/regen')
      .send({ email: 'ghost@example.com' });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns a new verification link for an existing user', async () => {
    const email = 'regen@example.com';
    await request(app)
      .post('/api/users/create')
      .send({ email, password: 'pass', firstName: 'Regen' });

    const res = await request(app)
      .post('/api/users/verify/regen')
      .send({ email });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.link).toBeDefined();
  });
});

// ─── POST /api/users/password/reset/request ───────────────────────────────

describe('POST /api/users/password/reset/request', () => {
  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/users/password/reset/request')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 404 for a non-existent user', async () => {
    const res = await request(app)
      .post('/api/users/password/reset/request')
      .send({ email: 'nobody@example.com' });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns a password reset link for an existing user', async () => {
    const email = 'resetreq@example.com';
    await request(app)
      .post('/api/users/create')
      .send({ email, password: 'pass', firstName: 'Reset' });

    const res = await request(app)
      .post('/api/users/password/reset/request')
      .send({ email });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.link).toBeDefined();
  });
});

// ─── POST /api/users/password/reset ───────────────────────────────────────

describe('POST /api/users/password/reset', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users/password/reset')
      .send({ email: 'x@x.com' }); // missing token and newPassword

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for an invalid reset token', async () => {
    const res = await request(app)
      .post('/api/users/password/reset')
      .send({ email: 'x@x.com', token: 'badtoken', newPassword: 'newpass' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('resets the password with a valid token', async () => {
    const email = 'pwreset@example.com';
    await request(app)
      .post('/api/users/create')
      .send({ email, password: 'oldpass', firstName: 'PwReset' });

    // Request a reset token
    const reqRes = await request(app)
      .post('/api/users/password/reset/request')
      .send({ email });

    const link = reqRes.body.data.link;
    const token = new URL(link).searchParams.get('token');

    const res = await request(app)
      .post('/api/users/password/reset')
      .send({ email, token, newPassword: 'newpass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
