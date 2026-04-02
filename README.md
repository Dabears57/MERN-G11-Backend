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
"success": boolean,
"data": {

}
"message": str
```