const crypto = require('crypto');
const bcrypt = require("bcrypt");

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

async function saltString(plainString, saltRounds){
    return await bcrypt.hash(plainString, saltRounds);
}

async function compareSaltedString(plainString, hashedString){
    return await bcrypt.compare(plainString, hashedString);
}

// helper: hash token
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

// =========================
// TOKEN GENERATION (RAW ONLY)
// =========================
function generateToken() {
    return crypto.randomBytes(32).toString("hex");
}

module.exports = {
    generateToken,
    saltPassword,
    compareSaltedPassword,
    hashToken,
    saltString,
    compareSaltedString
}