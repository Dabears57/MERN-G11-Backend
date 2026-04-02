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