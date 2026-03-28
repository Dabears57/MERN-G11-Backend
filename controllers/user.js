const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const jwtUtil = require("../utils/jwt-utils");
const crypto = require('crypto');


// =========================
// PASSWORD HELPERS
// =========================
async function saltPassword(plainPassword) {
    const SALT_ROUNDS = 10;
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function compareSaltedPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

// =========================
// TOKEN GENERATION (RAW ONLY)
// =========================
function generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
}

// =========================
// CREATE USER
// =========================
async function createUser(req, res) {
    try {
        const { email, password, firstName } = req.body;

        if (!email || !password || !firstName) {
            return res.status(400).json({
                error: "Name, Email, and Password is required"
            });
        }

        const hashedPassword = await saltPassword(password);

        // ONLY generate raw token (model hashes it)
        const rawToken = generateVerificationToken();

        await userModel.createUser(
            email,
            firstName,
            rawToken,
            hashedPassword
        );

        const verificationLink = `${process.env.APP_URL}/verify?token=${rawToken}`;

        return res.status(200).json({
            message: verificationLink
        });

    } catch (err) {
        if (err.message === "EMAIL_EXISTS") {
            return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
    }
}

// =========================
// VERIFY ACCOUNT
// =========================
async function verifyAccount(req, res) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Token required" });
        }

        // EVERYTHING to model
        await userModel.verifyUser(token);

        return res.json({ message: "Account verified!" });

    } catch (err) {
        if (err.message === "INVALID_OR_EXPIRED_TOKEN") {
            return res.status(400).json({
                error: "Invalid or expired token"
            });
        }
        return res.status(500).json({ error: err.message });
    }
}

// =========================
// LOGIN USER
// =========================
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and Password is required"
            });
        }

        const user = await userModel.findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                message: "No user found with that email"
            });
        }

        // use model guard instead of inline logic
        try {
            userModel.assertVerified(user);
        } catch (err) {
            if (err.message === "EMAIL_NOT_VERIFIED") {
                return res.status(403).json({
                    message: "Account is not verified"
                });
            }
            throw err;
        }

        const validPassword = await compareSaltedPassword(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(403).json({
                message: "Incorrect password"
            });
        }

        const jwt = jwtUtil.generateToken(email);

        return res.status(200).json({
            token: jwt
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function regenerateVerificationToken(req, res) {
    try {
        const { email } = req.body;
        if (!email){
            return res.status(400).json({ error: "Email required" });
        }

        const rawToken = await userModel.regenerateVerificationToken(email);

        // Create a verification link
        const verificationLink = `${process.env.APP_URL}/verify?token=${rawToken}`;

        // TODO: Send this link via email to the user
        return res.status(200).json({ message: "New token generated", verificationLink });
    } catch (err) {
        if (err.message === "USER_NOT_FOUND"){
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createUser,
    verifyAccount,
    loginUser,
    regenerateVerificationToken 
};