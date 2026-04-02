const jwt = require("jsonwebtoken");

// ⚠️ move this to env variable in production
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// token expiration (good default)
const EXPIRES_IN = "1h";

/**
 * Generate a JWT containing the user's email
 * @param {string} email
 * @returns {string} token
 */
function generateToken(userId, email, firstName) {
    return jwt.sign(
        { userId, email, firstName},  // payload
        SECRET_KEY,          // secret
        { expiresIn: EXPIRES_IN }
    );
}

/**
 * Verify a JWT and return decoded payload
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        throw new Error("INVALID_TOKEN");
    }
}

module.exports = {
    generateToken,
    verifyToken
};