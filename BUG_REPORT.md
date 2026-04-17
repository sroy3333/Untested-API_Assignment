# Bug Report — Task API

## Overview
This document outlines bugs identified through unit and integration testing using Jest and Supertest. Each bug includes expected vs actual behavior, root cause, and suggested fixes.


## 🐞 Bug 1: Status values mismatch between README and implementation

**Location:**  
- README.md (API docs)  
- src/utils/validators.js  
- src/services/taskService.js  

**Expected Behavior**
Status values should be consistent across:
- API documentation
- Validation layer
- Business logic

**Actual Behavior**
- README uses: `pending`, `in-progress`, `completed`
- Code uses: `todo`, `in_progress`, `done`

**Why it happens**
Mismatch between documentation and implementation. No shared constant or contract enforced.

**How I discovered it**
While testing filtering (`GET /tasks?status=...`), requests using README values failed validation.

**Fix**
- Option 1: Update README to match code (`todo`, `in_progress`, `done`)
- Option 2: Update code to match README (recommended for user-facing consistency)


## 🐞 Bug 2: Pagination edge case not validated

**Location:**  
src/routes/tasks.js  
src/services/taskService.js  

**Expected Behavior**
- Invalid values like `page=0`, `limit=0`, or negative numbers should return validation error (400)

**Actual Behavior**
- `page=0` results in negative offset → unexpected slice behavior
- `limit=0` returns empty array silently

**Why it happens**
No validation on query params:
```js
const pageNum = parseInt(page) || 1;
```

**How I discovered it**

By manually testing edge cases and noticing inconsistent results.


**Fix**

Add validation:

```
if (pageNum < 1 || limitNum < 1) {
  return res.status(400).json({ error: 'Invalid pagination params' });
}
```

## 🐞 Bug 3: update() allows invalid/unsafe field updates

**Location**

src/services/taskService.js

```
const updated = { ...tasks[index], ...fields };
```

**Expected Behavior**

- Only allowed fields should be updated:
title
description
status
priority
dueDate


**Actual Behavior**
- Any field can be overwritten:
id
createdAt
completedAt


**Why it happens**
- No field filtering before merging update payload.


**How I discovered it**
- By reasoning about update logic and lack of restrictions.

**Fix**
- Whitelist allowed fields:

```
const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
```

## 🐞 Bug 4: assignTask duplicates validation logic

**Location**

src/routes/tasks.js
src/services/taskService.js

**Expected Behavior**
- Validation should exist in one place (preferably service layer)

**Actual Behavior**
- Validation exists in both:
Route
Service

**Why it happens**
- Validation responsibility not clearly defined

**How I discovered it**
- While implementing feature and reviewing redundancy

**Fix**
- Remove validation from route and centralize in service:

```
if (!assignee || assignee.trim() === '') {
  throw new Error('Assignee cannot be empty');
}
```


## 🐞 Bug 5: Validators not fully covered by tests

**Location**

src/utils/validators.js
(Coverage shows ~69%)


**Expected Behavior**
- All validation branches should be tested

**Actual Behavior**
- Edge cases not tested:
invalid priority
invalid status
invalid dueDate

**Why it happens**
- Focus was on API-level tests, not validator unit tests

**How I discovered it**
- From coverage report:

validators.js 69.56% coverage

**Fix**
- Add unit tests for:
invalid status
invalid priority
invalid dueDate


### Feature Implementation: Assign Task ###

**Endpoint**
PATCH /tasks/:id/assign

**Design Decisions**
1. Validation

- Empty assignee → 400 error
- Handled in both route and service (though ideally should be centralized)
2. Behavior Choice

- Reassignment is allowed (overwrite existing assignee)
- Simpler and avoids unnecessary constraints

3. Error Handling
- Non-existing task → 404
- Invalid input → 400

4. Data Model
- Added assignee field dynamically (no schema enforcement due to in-memory store)


**Observations & Tradeoffs**

What surprised me
- Documentation mismatch (status values)
- Lack of validation for pagination
- Open-ended update logic (can overwrite critical fields)


Tradeoffs made
- Allowed reassignment instead of restricting it (simpler logic)
- Did not introduce schema validation (kept in-memory design simple)


**What I would test next**
- Concurrent updates (race conditions)
- Large dataset pagination performance
- Data persistence (if DB added)
- Authorization (who can update/delete tasks)

**Questions before production**
- Should status values follow API docs or current implementation?
- Should reassignment overwrite or be restricted?
- Should completed tasks be editable?
- Should we enforce stricter schema validation?
