const db = require("../utils/mongo-utils");
const crypto = require("crypto");

const DATABASE_STR = "development"; // should change this later 
const TOKEN_EXPIRE_TIME_MS = 1000 * 60 * 60; // 1 hour

function getCollection() {
    return db.getDb(DATABASE_STR).collection("users");
}

// create unique index (call once on startup)
async function init() {
    const users = getCollection();
    await users.createIndex({ email: 1 }, { unique: true });
}

// helper: hash token
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

// create user (production-safe)
async function createUser(email, firstName, rawToken, hashedPassword) {
    const users = getCollection();

    const tokenHash = hashToken(rawToken);

    try {
        const result = await users.insertOne({
            email,
            password: hashedPassword,
            firstName,
            verified: false,
            verificationTokenHash: tokenHash,
            verificationTokenExpires: Date.now() + TOKEN_EXPIRE_TIME_MS,
            createdAt: new Date()
        });

        return result;
    } catch (err) {
        if (err.code === 11000) {
            throw new Error("EMAIL_EXISTS");
        }
        throw err;
    }
}

async function findUserByEmail(email) {
    return await getCollection().findOne({ email });
}

async function verifyUser(rawToken) {
    const users = getCollection();
    const tokenHash = hashToken(rawToken);

    const user = await users.findOne({
        verificationTokenHash: tokenHash,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error("INVALID_OR_EXPIRED_TOKEN");
    }

    if(user.verified){
        throw new Error("Account Already Verified");
    }

    await users.updateOne(
        { _id: user._id },
        {
            $set: { verified: true },
            $unset: {
                verificationTokenHash: "",
                verificationTokenExpires: ""
            }
        }
    );

    return user;
}

async function setVerificationToken(userId, rawToken) {
    const users = getCollection();
    const tokenHash = hashToken(rawToken);

    await users.updateOne(
        { _id: userId },
        {
            $set: {
                verificationTokenHash: tokenHash,
                verificationTokenExpires: Date.now() + TOKEN_EXPIRE_TIME_MS
            }
        }
    );
}

// ==================== REGENERATE VERIFICATION TOKEN ====================
async function regenerateVerificationToken(email) {
    const users = getCollection();

    // Find user by email
    const user = await users.findOne({ email });
    if (!user) throw new Error("USER_NOT_FOUND");

    // Generate new token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Update user with new token & expiry
    await users.updateOne(
        { _id: user._id },
        {
            $set: {
                verificationTokenHash: hashedToken,
                verificationTokenExpires: Date.now() + TOKEN_EXPIRE_TIME_MS,
            }
        }
    );

    // Return the raw token for sending via email
    return rawToken;
}

function assertVerified(user) {
    if (!user.verified) {
        throw new Error("EMAIL_NOT_VERIFIED");
    }
}

module.exports = {
    init,
    createUser,
    findUserByEmail,
    verifyUser,
    setVerificationToken,
    assertVerified,
    regenerateVerificationToken
};