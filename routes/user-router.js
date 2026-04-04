const express = require("express");
const router = express.Router();
const userService = require("../services/users");

async function createUser(req, res) {
    try {
        const { email, password, firstName } = req.body;

        // verify the input parameters
        // TODO had isEmail check and Password Requirements 
        if (!email || !password || !firstName) {
            return res.status(400).json({
                success: false,
                error: "Name, Email, and Password is required",
                message: "missing required field"
            });
        }

        // create user and get verification link
        const verificationLink = await userService.createUser(
            email, 
            password, 
            firstName);

        // TODO send verification link over email

        return res.status(200).json({
            success: true,
            data:{
                verificationLink: verificationLink
            },
            message: "user created, please follow verification link"
        });

    } catch (err) {
        if (err.message === "EMAIL_EXISTS") {
            return res.status(400).json({ 
                success: false,
                error: "Email already exists",
                message: "See error field"
            });
        }

        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unkown error check message"});
    }
}

async function verifyAccount(req, res) {
    try {
        const token = req.query.token;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: "token required in query parameter",
                message: "no verification token found"
            });
        }

        await userService.verifyUser(token);

        return res.json({
            success: true,
            data: null,
            message: "Account verified!"
        });

    } catch (err) {
        if (err.message === "INVALID_OR_EXPIRED_TOKEN") {
            return res.status(400).json({
                success: false,
                error: "Invalid or expired token",
                message: "invalid token read error message"
            });
        }
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error message please see error field"
        });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and Password is required",
                message: "Email and Password is required",
            });
        }
  
        const jwt = await userService.loginUser(email, password);

        return res.status(200).json({
            success: true,
            data: {
                token: jwt,
            },
            message: "token generated!"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unkown error please see error message"
        });
    }
}

async function regenerateVerificationToken(req, res) {
    try {
        const { email } = req.body;
        if (!email){
            return res.status(400).json({
                success: false,
                error: "Email required",
                message: "Email required" 
            });
        }

        const verificationLink = await userService.regenerateVerificationToken(email);
        
        // TODO: Send this link via email to the user
        return res.status(200).json({
            success: true,
            data: {
                link: verificationLink 
            },
            message: "New token generated",
        });
    } catch (err) {
        console.log(err);

        if (err.message === "USER_NOT_FOUND"){
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "User not found"
            });
        }

        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unkown error please see error field"
        });
    }
}

async function requestPasswordReset(req, res){
     try {
        const { email } = req.body;
        if (!email){
            return res.status(400).json({ 
                success: false,
                error: "Email required",
                message: "Email required"
            });
        }

        const verificationLink = await userService.generatePasswordResetToken(email);

        // TODO: Send this link via email to the user
        return res.status(200).json({ 
            success: true,
            data: {
                link: verificationLink
            },
            message: "New token generated", verificationLink });
    } catch (err) {
        console.log(err);

        if (err.message === "USER_NOT_FOUND"){
            return res.status(404).json({
                success: false, 
                error: "User not found",
                message: "User not found"
            });
        }

        return res.status(500).json({
            success: false, 
            error: err.message,
            message: "server error please find message"
        });
    }
}


/*
{
    "token": token,
    "password": password,
}
*/
async function resetPassword(req,res){
    try {
        const {email, token, newPassword} = req.body;
        if (!email ||  !token || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "email or token or password not found in body",
                message: "email or token or password not found in body"
            });
        }

        await userService.resetPassword(email, token, newPassword);

        return res.json({
            success: true,
            data: null,
            message: "account successfully reset password!"
        });

    } catch (err) {
        if (err.message === "INVALID_OR_EXPIRED_TOKEN") {
            return res.status(400).json({
                success: false,
                error: "Invalid or expired token",
                message: "invalid token read error message"
            });
        }
        if (err.message === "USER_NOT_FOUND"){
            return res.status(404).json({
                success: false, 
                error: "User not found",
                message: "User not found"
            });
        }
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error message please see error field"
        });
    }
}

// routing the functions...

router.get("/verify", verifyAccount);

router.post("/create", createUser);
router.post("/login", loginUser);
router.post("/verify/regen", regenerateVerificationToken);
router.post("/password/reset/request", requestPasswordReset);
router.post("/password/reset", resetPassword);

module.exports = router;