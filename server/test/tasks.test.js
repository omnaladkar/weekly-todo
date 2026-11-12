import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createFileRepository } from '../src/repository/fileRepository.js';

let app;
let dataDir;

const sampleTask = (overrides = {}) => ({
  title: 'Prepare sprint review',
  description: 'Collect metrics from the dashboard',
  dueAt: '2026-11-12T09:30:00.000Z',
  priority: 'high',
  ...overrides,
});

before(async () => {
  dataDir = await mkdtemp(path.join(os.tmpdir(), 'weekly-todo-api-'));
  const repo = await createFileRepository(dataDir);
  app = createApp(repo);
});

after(async () => {
  await rm(dataDir, { recursive: true, force: true });
});

test('GET /api/health reports the service is up', async () => {
  const res = await request(app).get('/api/health').expect(200);
  assert.equal(res.body.status, 'ok');
  assert.equal(typeof res.body.time, 'string');
});

test('POST /api/tasks creates a task with defaults', async () => {
  const res = await request(app)
    .post('/api/tasks')
    .send({ title: '  Ship assignment  ', dueAt: '2026-11-13T18:00:00.000Z' })
    .expect(201);

  assert.ok(res.body.data.id);
  assert.equal(res.body.data.title, 'Ship assignment');
  assert.equal(res.body.data.description, '');
  assert.equal(res.body.data.priority, 'medium');
  assert.equal(res.body.data.status, 'in_progress');
  assert.equal(res.body.data.dueAt, '2026-11-13T18:00:00.000Z');
  assert.ok(res.body.data.createdAt);
  assert.ok(res.body.data.updatedAt);
});

test('POST /api/tasks validates required fields and enums', async () => {
  const noTitle = await request(app)
    .post('/api/tasks')
    .send({ dueAt: '2026-11-13T18:00:00.000Z' })
    .expect(400);
  assert.match(noTitle.body.error, /title/i);

  const noDate = await request(app)
    .post('/api/tasks')
    .send({ title: 'No date' })
    .expect(400);
  assert.match(noDate.body.error, /date/i);

  const badDate = await request(app)
    .post('/api/tasks')
    .send({ title: 'Bad date', dueAt: 'not-a-date' })
    .expect(400);
  assert.match(badDate.body.error, /valid date/i);

  const badPriority = await request(app)
    .post('/api/tasks')
    .send(sampleTask({ priority: 'urgent' }))
    .expect(400);
  assert.match(badPriority.body.error, /priority/i);
});

test('GET /api/tasks returns tasks sorted by due date', async () => {
  const later = await request(app)
    .post('/api/tasks')
    .send(sampleTask({ title: 'Later task', dueAt: '2026-12-20T10:00:00.000Z' }))
    .expect(201);
  const earlier = await request(app)
    .post('/api/tasks')
    .send(sampleTask({ title: 'Earlier task', dueAt: '2026-11-01T10:00:00.000Z' }))
    .expect(201);

  const res = await request(app).get('/api/tasks').expect(200);
  const dates = res.body.data.map((task) => new Date(task.dueAt).getTime());
  const sorted = [...dates].sort((a, b) => a - b);
  assert.deepEqual(dates, sorted);

  const ids = res.body.data.map((task) => task.id);
  assert.ok(ids.indexOf(earlier.body.data.id) < ids.indexOf(later.body.data.id));
});

test('GET /api/tasks?q= searches title and description', async () => {
  await request(app)
    .post('/api/tasks')
    .send(sampleTask({ title: 'Quarterly budget', description: 'Finance planning' }))
    .expect(201);

  const byTitle = await request(app).get('/api/tasks?q=budget').expect(200);
  assert.equal(byTitle.body.data.length, 1);
  assert.equal(byTitle.body.data[0].title, 'Quarterly budget');

  const byDescription = await request(app).get('/api/tasks?q=finance').expect(200);
  assert.equal(byDescription.body.data.length, 1);

  const noMatch = await request(app).get('/api/tasks?q=zzzz').expect(200);
  assert.deepEqual(noMatch.body.data, []);
});

test('GET /api/tasks/:id returns one task and 404s for unknown ids', async () => {
  const created = await request(app).post('/api/tasks').send(sampleTask()).expect(201);
  const id = created.body.data.id;

  const res = await request(app).get(`/api/tasks/${id}`).expect(200);
  assert.equal(res.body.data.id, id);

  await request(app).get('/api/tasks/does-not-exist').expect(404);
});

test('PATCH /api/tasks/:id updates fields and task status', async () => {
  const created = await request(app)
    .post('/api/tasks')
    .send(sampleTask({ title: 'Mark me done' }))
    .expect(201);
  const id = created.body.data.id;

  const res = await request(app)
    .patch(`/api/tasks/${id}`)
    .send({ title: 'Marked done', status: 'completed', priority: 'low' })
    .expect(200);

  assert.equal(res.body.data.title, 'Marked done');
  assert.equal(res.body.data.status, 'completed');
  assert.equal(res.body.data.priority, 'low');

  await request(app).patch(`/api/tasks/${id}`).send({}).expect(400);
  await request(app).patch(`/api/tasks/${id}`).send({ status: 'archived' }).expect(400);
  await request(app).patch('/api/tasks/missing-id').send({ title: 'x' }).expect(404);
});

test('DELETE /api/tasks/:id removes the task exactly once', async () => {
  const created = await request(app)
    .post('/api/tasks')
    .send(sampleTask({ title: 'Delete me' }))
    .expect(201);
  const id = created.body.data.id;

  const res = await request(app).delete(`/api/tasks/${id}`).expect(200);
  assert.equal(res.body.data.id, id);

  await request(app).delete(`/api/tasks/${id}`).expect(404);
  await request(app).get(`/api/tasks/${id}`).expect(404);
});

test('unknown API routes return JSON 404s', async () => {
  const res = await request(app).get('/api/nope').expect(404);
  assert.equal(res.body.error, 'Not found');
});
