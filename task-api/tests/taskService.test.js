const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('Task Service', () => {
  test('should create a task', () => {
    const task = taskService.create({ title: 'Test task' });

    expect(task).toHaveProperty('id');
    expect(task.title).toBe('Test task');
    expect(task.status).toBe('todo');
  });

  test('should filter by exact status', () => {
    taskService.create({ title: 'A', status: 'todo' });
    taskService.create({ title: 'B', status: 'done' });

    const result = taskService.getByStatus('todo');

    expect(result.length).toBe(1);
  });

  test('pagination should return correct page', () => {
    for (let i = 0; i < 20; i++) {
      taskService.create({ title: `Task ${i}` });
    }

    const page1 = taskService.getPaginated(1, 10);
    expect(page1.length).toBe(10);
  });

  test('should return null for non-existing update', () => {
    const result = taskService.update('invalid-id', { title: 'X' });
    expect(result).toBeNull();
  });

  test('should mark task complete', () => {
    const task = taskService.create({ title: 'Test' });

    const updated = taskService.completeTask(task.id);

    expect(updated.status).toBe('done');
    expect(updated.completedAt).not.toBeNull();
  });
});