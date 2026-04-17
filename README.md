## Task API — Tested Version

### Getting Started

**Prerequisites:** Node.js 18+

cd task-api
npm install
npm start        # runs on http://localhost:3000

**Tests:**

npm test           # run test suite
npm run coverage   # run with coverage report


## Project Structure

task-api/
  coverage
  src/
    app.js                  # Express app setup
    routes/tasks.js         # Route handlers
    services/taskService.js # Business logic + in-memory data store
    utils/validators.js     # Input validation helpers
  tests/                    # test files
    tasks.test.js
    taskService.test.js
  jest.config.js
  package-lock.json
  package.json
.gitignore
README.md


## API Reference

Method	           Path	                                  Description
POST	             /tasks	                                Create a new task
GET	               /tasks	                                List all tasks. Supports ?status=, ?page=, ?limit=
GET                /tasks?status=todo                     Filter by status
GET                /tasks?page=1&limit=10                 Pagination
PUT	               /tasks/:id	                            Full update of a task
DELETE	           /tasks/:id	                            Delete a task (returns 204)
PATCH	             /tasks/:id/complete	                  Mark a task as complete
PATCH	             /tasks/:id/assign	                    Assign a task to a user (to implement)
GET	               /tasks/stats	                          Counts by status + overdue count

### Task shape

{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "pending | in-progress | done",
  "priority": "low | medium | high",
  "dueDate": "ISO string | null",
  "completedAt": "ISO string | null",
  "createdAt": "ISO string"
  "assignee": "string (optional)"
}



### Sample requests

**Create a task**

curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write tests", "priority": "high"}'


**List tasks with filter**

curl "http://localhost:3000/tasks?status=pending&page=1&limit=10"

**Mark complete**

curl -X PATCH http://localhost:3000/tasks/<id>/complete


### Test Coverage Summary


 PASS  tests/tasks.test.js
 PASS  tests/taskService.test.js
-----------------|---------|----------|---------|---------|---------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s   
-----------------|---------|----------|---------|---------|---------------------
All files        |   90.32 |    77.01 |    93.1 |   89.36 |                     
 src             |   69.23 |       75 |       0 |   69.23 |                     
  app.js         |   69.23 |       75 |       0 |   69.23 | 10-11,17-18         
 src/routes      |   96.29 |    88.46 |     100 |   96.29 |                     
  tasks.js       |   96.29 |    88.46 |     100 |   96.29 | 43,88               
 src/services    |   96.92 |    78.26 |     100 |   96.07 | 
  taskService.js |   96.92 |    78.26 |     100 |   96.07 | 24,87
 src/utils       |   69.56 |    67.64 |     100 |   69.56 | 
  validators.js  |   69.56 |    67.64 |     100 |   69.56 | 9,12,15,22,25,28,31
-----------------|---------|----------|---------|---------|---------------------

Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        0.854 s, estimated 1 s

Achieved >80% coverage

### Notes

The data store is in-memory. It resets every time the server restarts.
Tests cover unit + integration
Edge cases included