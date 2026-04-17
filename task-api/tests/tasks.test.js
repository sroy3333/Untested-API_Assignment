const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API (Integration Tests)', () => {
  let taskId;

  beforeEach(() => {
    taskService._reset(); // reset in-memory DB before each test
  });

  // ✅ CREATE TASK
  test('POST /tasks - should create a task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({
        title: 'Test Task',
        priority: 'high'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Task');

    taskId = res.body.id;
  });

  // ❌ CREATE TASK - INVALID
  test('POST /tasks - should fail without title', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({});

    expect(res.statusCode).toBe(400);
  });

  // ✅ GET ALL TASKS
  test('GET /tasks - should return all tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });

    const res = await request(app).get('/tasks');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  // ✅ FILTER TASKS
  test('GET /tasks?status=todo - should filter tasks', async () => {
    await request(app).post('/tasks').send({ title: 'A', status: 'todo' });
    await request(app).post('/tasks').send({ title: 'B', status: 'done' });

    const res = await request(app).get('/tasks?status=todo');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  // ✅ PAGINATION
  test('GET /tasks?page=1&limit=2 - should paginate tasks', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/tasks').send({ title: `Task ${i}` });
    }

    const res = await request(app).get('/tasks?page=1&limit=2');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  // ✅ UPDATE TASK
  test('PUT /tasks/:id - should update task', async () => {
    const create = await request(app)
      .post('/tasks')
      .send({ title: 'Old Task' });

    const res = await request(app)
      .put(`/tasks/${create.body.id}`)
      .send({ title: 'Updated Task' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Task');
  });

  // ❌ UPDATE NON-EXISTING
  test('PUT /tasks/:id - should return 404 for invalid id', async () => {
    const res = await request(app)
      .put('/tasks/invalid-id')
      .send({ title: 'Test' });

    expect(res.statusCode).toBe(404);
  });

  // ✅ COMPLETE TASK
  test('PATCH /tasks/:id/complete - should mark as done', async () => {
    const create = await request(app)
      .post('/tasks')
      .send({ title: 'Task' });

    const res = await request(app)
      .patch(`/tasks/${create.body.id}/complete`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.completedAt).not.toBeNull();
  });

  // ❌ COMPLETE NON-EXISTING
  test('PATCH /tasks/:id/complete - should return 404', async () => {
    const res = await request(app)
      .patch('/tasks/invalid-id/complete');

    expect(res.statusCode).toBe(404);
  });

  // ✅ DELETE TASK
  test('DELETE /tasks/:id - should delete task', async () => {
    const create = await request(app)
      .post('/tasks')
      .send({ title: 'Task' });

    const res = await request(app)
      .delete(`/tasks/${create.body.id}`);

    expect(res.statusCode).toBe(204);
  });

  // ❌ DELETE NON-EXISTING
  test('DELETE /tasks/:id - should return 404', async () => {
    const res = await request(app)
      .delete('/tasks/invalid-id');

    expect(res.statusCode).toBe(404);
  });

  // ✅ STATS
  test('GET /tasks/stats - should return stats', async () => {
    await request(app).post('/tasks').send({ title: 'A', status: 'todo' });
    await request(app).post('/tasks').send({ title: 'B', status: 'done' });

    const res = await request(app).get('/tasks/stats');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('todo');
    expect(res.body).toHaveProperty('done');
  });

  // ✅ ASSIGN TASK (your feature)
  test('PATCH /tasks/:id/assign - should assign task', async () => {
    const create = await request(app)
      .post('/tasks')
      .send({ title: 'Task' });

    const res = await request(app)
      .patch(`/tasks/${create.body.id}/assign`)
      .send({ assignee: 'Sukanya' });

    expect(res.statusCode).toBe(200);
    expect(res.body.assignee).toBe('Sukanya');
  });

  // ❌ ASSIGN EMPTY
  test('PATCH /tasks/:id/assign - should fail for empty assignee', async () => {
    const create = await request(app)
      .post('/tasks')
      .send({ title: 'Task' });

    const res = await request(app)
      .patch(`/tasks/${create.body.id}/assign`)
      .send({ assignee: '' });

    expect(res.statusCode).toBe(400);
  });

  // ❌ ASSIGN NON-EXISTING
  test('PATCH /tasks/:id/assign - should return 404', async () => {
    const res = await request(app)
      .patch('/tasks/invalid-id/assign')
      .send({ assignee: 'User' });

    expect(res.statusCode).toBe(404);
  });

});