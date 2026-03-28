const express = require("express");
const router = express.Router();
const userService = require("../services/user");

async function createUser(req, res) {
    try {
        const { email, password, firstName } = req.body;

        // verify the input parameters
        // TODO had isEmail check and Password Requirements 
        if (!email || !password || !firstName) {
            return res.status(400).json({
                error: "Name, Email, and Password is required"
            });
        }

        // create user and get verification link
        const verificationLink = await userService.createUser(
            email, 
            password, 
            firstName);

        // TODO send verification link over email

        return res.status(200).json({
            message: verificationLink
        });

    } catch (err) {
        console.log(err);

        if (err.message === "EMAIL_EXISTS") {
            return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
    }
}

async function verifyAccount(req, res) {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: "Token required" });
        }

        await userService.verifyUser(token);

        return res.json({ message: "Account verified!" });

    } catch (err) {
        console.log(err);

        if (err.message === "INVALID_OR_EXPIRED_TOKEN") {
            return res.status(400).json({
                error: "Invalid or expired token"
            });
        }
        return res.status(500).json({ error: err.message });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and Password is required"
            });
        }
    
        const jwt = await userService.loginUser(email, password);

        return res.status(200).json({
            token: jwt
        });

    } catch (err) {
        console.log("sending error")
        console.log(err);

        return res.status(500).json({ error: err.message });
    }
}

async function regenerateVerificationToken(req, res) {
    try {
        const { email } = req.body;
        if (!email){
            return res.status(400).json({ error: "Email required" });
        }

        const verificationLink = await userService.regenerateVerificationToken(email);
        
        // TODO: Send this link via email to the user
        return res.status(200).json({ message: "New token generated", verificationLink });
    } catch (err) {
        console.log(err);

        if (err.message === "USER_NOT_FOUND"){
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(500).json({ error: err.message });
    }
}

async function requestPasswordReset(req, res){
    //  try {
    //     const { email } = req.body;
    //     if (!email){
    //         return res.status(400).json({ error: "Email required" });
    //     }

    //     const rawToken = await userModel.generatePasswordResetToken(email);

    //     // Create a verification link
    //     const verificationLink = `${process.env.APP_URL}/password/reset?token=${rawToken}`;

    //     // TODO: Send this link via email to the user
    //     return res.status(200).json({ message: "New token generated", verificationLink });
    // } catch (err) {
    //     console.log(err);

    //     if (err.message === "USER_NOT_FOUND"){
    //         return res.status(404).json({ error: "User not found" });
    //     }

    //     return res.status(500).json({ error: err.message });
    // }
}


async function resetPassword(req,res){

}

// routing the functions...

router.post("/create", createUser);
router.post("/login", loginUser);
router.post("/verify", verifyAccount);
router.post("/verify/regen", regenerateVerificationToken);
router.post("/password/reset/request", requestPasswordReset);
router.post("/password/reset", resetPassword);

module.exports = router;