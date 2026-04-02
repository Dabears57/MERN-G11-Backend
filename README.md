# MERN PROJECT BACKEND

## Installation / Running

I developed the backend using NodeJS version `v24.13.0`, but older and newer versions should work fine.

### Prerequsites
Ensure NodeJS is installed on your machine.
```bash
node -v # should output a version vXX.XX.X
```
You are also required to have a .env file which can be found in the discord.
```.env
MONGODB_URI=
JWT_SECRET=
PORT=
APP_URL=
```

### Install
```bash
# clone repo
git clone https://github.com/Dabears57/MERN-G11-Backend
cd MERN-G11-Backend 
node install -y # install node modules
```

### Running
```bash
node server.js
```

# API Documentation

For testing the API I like to use the built in plugin for VsCode **EchoAPI for VS Code**, but any API debugging tool would work the same. 

## Responses
All responses are formatted in the following structure:

**Successful**
```json
{
    "success": true,
    "data": {}, // data from response
    "message": "message from server..."
}
```

**Error Response**
```json
{
    "success": false,
    "error": "error string from server...",
    "message": "message from server..."
}
```

## Users
All Routes
```
POST /api/users/create
POST /api/users/login
GET /api/users/verify
POST /api/users/verify/regen
POST /api/users/password/reset/request
POST /api/users/reset
```

### Creating A User

```
POST /api/users/create
```

This route is reasonable for creating a user within the database. It will fail if it sees an email which already exists. It will return you a link for which the user should be able to click on to verify their account.

**Request**
```json
"Method": "POST",
"Route": "api/users/create".
"Body": {
    "email": str,
    "password": str,
    "firstName": str
}
```

**Response**
```json
{
    "success": true,
    "data": {
        "verificationLink": "link for verification"
    }
    "message": str
}
```

### Verifying the User
```
GET /api/users/verify?token=
```
This route is used to verify a user. We should expect a search query parameter called token. We will return whether your account has been verified or not.

**Response**
```json
{
    "success": true,
    "data": null,
    "message": ...
}
```

### Login User
```
POST /api/users/login
```
This route is used to authenticate a user with their email and password. If successful, it returns a JWT token which should be used for authenticated requests.

**Request**
```json
{
    "Method": "POST",
    "Route": "api/users/login",
    "Body": {
        "email": str,
        "password": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {
        "token": "jwt token"
    },
    "message": "token generated!"
}
```

### Regenerate Verification Token
```bash
POST /api/users/verify/regen
```

This route generates a new verification token for a user who has not yet verified their account. A new verification link is returned.

**Request**
```json
{
    "Method": "POST",
    "Route": "api/users/verify/regen",
    "Body": {
        "email": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {
        "link": "new verification link"
    },
    "message": "New token generated"
}
```

### Request Password Reset 
```bash
POST /api/users/password/reset/request
```
This route is intended to generate a password reset token for a user. The token should be sent via email as part of a password reset link.

 Note: This route is currently not fully implemented in the backend.

**Request**
```json
{
    "Method": "POST",
    "Route": "api/users/password/reset/request",
    "Body": {
        "email": str
    }
}
```

**Response (Expected)**
```json
{
    "success": true,
    "data": {
        "verificationLink": "password reset link"
    },
    "message": "New token generated"
}
```

### Reset Password
```bash
POST /api/users/password/reset
```
This route is intended to reset a user’s password using a valid reset token.

Note: This route is currently not implemented in the backend.

**Request**
```json
{
    "Method": "POST",
    "Route": "api/users/password/reset",
    "Body": {
        "token": str,
        "newPassword": str
    }
}
```

**Response (Expected)**
```json
{
    "success": true,
    "data": null,
    "message": "Password successfully reset"
}
```

## Tasks
All Routes
```
POST /api/tasks/create
GET /api/tasks/fetch/one
GET /api/tasks/fetch/many
PUT /api/tasks/update
DELETE /api/tasks/delete
```

---

### Create Task
```
POST /api/tasks/create
```

This route creates a new task under a given project.

**Request**
```json
{
    "Method": "POST",
    "Route": "api/tasks/create",
    "Body": {
        "projectId": str,
        "name": str,
        "description": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "task created successfully"
}
```

---

### Get Single Task
```
GET /api/tasks/fetch/one
```

This route fetches a single task based on a search query.

**Request**
```json
{
    "Method": "GET",
    "Route": "api/tasks/fetch/one",
    "Body": {
        // flexible search query (e.g. id, projectId, etc.)
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "task fetched successfully"
}
```

---

### Get Multiple Tasks
```
GET /api/tasks/fetch/many
```

This route fetches multiple tasks based on a search query.

**Request**
```json
{
    "Method": "GET",
    "Route": "api/tasks/fetch/many",
    "Body": {
        // flexible search query
    }
}
```

**Response**
```json
{
    "success": true,
    "data": [],
    "message": "tasks fetched successfully"
}
```

### Update Task
```
PUT /api/tasks/update
```

This route updates a task using its ID and an update object.

**Request**
```json
{
    "Method": "PUT",
    "Route": "api/tasks/update",
    "Body": {
        "id": str,
        "update": {}
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "task updated successfully"
}
```

---

### Delete Task
```
DELETE /api/tasks/delete
```

This route deletes a task by its ID.

**Request**
```json
{
    "Method": "DELETE",
    "Route": "api/tasks/delete",
    "Body": {
        "id": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "task deleted successfully"
}
```

## Sessions
All Routes
```
POST /api/sessions/create
POST /api/sessions/stop
GET /api/sessions/fetch/one
GET /api/sessions/fetch/many
DELETE /api/sessions/delete
```

### Start Session
```
POST /api/sessions/create
```

This route starts a new session for a given project.

**Request**
```json
{
    "Method": "POST",
    "Route": "api/sessions/create",
    "Body": {
        "projectId": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "session started successfully"
}
```

---

### Stop Session
```
POST /api/sessions/stop
```

This route stops an active session.

**Request**
```json
{
    "Method": "POST",
    "Route": "api/sessions/stop",
    "Body": {
        "id": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "session stopped successfully"
}
```

---

### Get Single Session
```
GET /api/sessions/fetch/one
```

This route fetches a single session based on a search query.

**Request**
```json
{
    "Method": "GET",
    "Route": "api/sessions/fetch/one",
    "Body": {
        // flexible search query
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "session fetched successfully"
}
```

---

### Get Multiple Sessions
```
GET /api/sessions/fetch/many
```

This route fetches multiple sessions based on a search query.

**Request**
```json
{
    "Method": "GET",
    "Route": "api/sessions/fetch/many",
    "Body": {
        // flexible search query
    }
}
```

**Response**
```json
{
    "success": true,
    "data": [],
    "message": "sessions fetched successfully"
}
```

---

### Delete Session
```
DELETE /api/sessions/delete
```

This route deletes a session by its ID.

**Request**
```json
{
    "Method": "DELETE",
    "Route": "api/sessions/delete",
    "Body": {
        "id": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "session deleted successfully"
}
```

## Projects
All Routes
```
POST /api/projects/create
GET /api/projects/fetch/one
GET /api/projects/fetch/many
PUT /api/projects/update
DELETE /api/projects/delete
```

---

### Create Project
```
POST /api/projects/create
```

This route creates a new project.

**Request**
```json
{
    "Method": "POST",
    "Route": "api/projects/create",
    "Body": {
        "title": str,
        "description": str,
        "id": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "project created successfully"
}
```

---

### Get Single Project
```
GET /api/projects/fetch/one
```

This route fetches a single project based on a search query.

**Request**
```json
{
    "Method": "GET",
    "Route": "api/projects/fetch/one",
    "Body": {
        // flexible search query
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "project fetched successfully"
}
```

---

### Get Multiple Projects
```
GET /api/projects/fetch/many
```

This route fetches multiple projects based on a search query.

**Request**
```json
{
    "Method": "GET",
    "Route": "api/projects/fetch/many",
    "Body": {
        // flexible search query
    }
}
```

**Response**
```json
{
    "success": true,
    "data": [],
    "message": "projects fetched successfully"
}
```

---

### Update Project
```
PUT /api/projects/update
```

This route updates a project using its ID and an update object.

**Request**
```json
{
    "Method": "PUT",
    "Route": "api/projects/update",
    "Body": {
        "id": str,
        "update": {}
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "project updated successfully"
}
```

---

### Delete Project
```
DELETE /api/projects/delete
```

This route deletes a project by its ID.

**Request**
```json
{
    "Method": "DELETE",
    "Route": "api/projects/delete",
    "Body": {
        "id": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "project deleted successfully"
}
```

## Notes
All Routes
```
POST /api/notes/create
GET /api/notes/fetch/one
GET /api/notes/fetch/many
DELETE /api/notes/delete
```

---

### Create Note
```
POST /api/notes/create
```

This route creates a new note attached to a parent entity (e.g. project, task, session).

**Request**
```json
{
    "Method": "POST",
    "Route": "api/notes/create",
    "Body": {
        "content": str,
        "parentType": str,
        "parentId": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "note created successfully"
}
```

---

### Get Single Note
```
GET /api/notes/fetch/one
```

This route fetches a single note based on a search query.

**Request**
```json
{
    "Method": "GET",
    "Route": "api/notes/fetch/one",
    "Body": {
        // flexible search query
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "note fetched successfully"
}
```

---

### Get Multiple Notes
```
GET /api/notes/fetch/many
```

This route fetches multiple notes based on a search query.

**Request**
```json
{
    "Method": "GET",
    "Route": "api/notes/fetch/many",
    "Body": {
        // flexible search query
    }
}
```

**Response**
```json
{
    "success": true,
    "data": [],
    "message": "notes fetched successfully"
}
```

---

### Delete Note
```
DELETE /api/notes/delete
```

This route deletes a note by its ID.

**Request**
```json
{
    "Method": "DELETE",
    "Route": "api/notes/delete",
    "Body": {
        "id": str
    }
}
```

**Response**
```json
{
    "success": true,
    "data": {},
    "message": "note deleted successfully"
}
```