# Backend-Test-1:
## Features for testing
Test-Date: 4/6/26, 1:30pm (EST)

Accounts:
- Account Creation
- Account Verify
- Account Login
- Account Reset Password

Projects:
- Create Project
- View Project
- Update Project
- Delete Project

Tasks:
- Add tasks
- Fetch Tasks 
- Delete Tasks

Sessions:
- Create session
- Start session
- Pause Session
- Add Task to session
- Pause Task
- Stop session
- View Session data

Notes:
- Add notes
- fetch notes

## Test Results

### Accounts
#### Account Creation
Test strategy:
- Creating a fresh account with my personal email to test to see the email send. [PASS]
- First Send missing fields to check if verification exists [PASS]
- try and create an account with the same email again (should expect error) [PASS]

```
POST /api/users/create
{
    "email": "mypersonal",
    "password": "password",
    "firstName": "test"
}
```

#### Account Verify
Test strategy:
- try a valid link [PASS]
- try an invalid link [PASS]
- try a valid link after an account is already verified [PASS]

```
GET /api/users/verify?token=
{
}
```

#### Account Login
#### Account Reset Password

### Projects:
#### Create Project
#### View Project
#### Update Project
#### Delete Project

### Tasks:
#### Add tasks
#### Fetch Tasks 
####  Delete Tasks

### Sessions:
#### Create session
#### Start session
#### Pause Session
#### Add Task to session
#### Pause Task
#### Stop session
#### View Session data

### Notes:
#### Add notes
#### fetch notes 