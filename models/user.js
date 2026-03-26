const db = require("../utils/mongo-utils");

const DATABASE_STR = "development"; // should change this later 

// create unique index (call this once on startup)
async function init() {
    const users = db.getDb(DATABASE_STR).collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
}

// create user (production-safe)
async function createUser(email, hashedPassword) {
    const users = db.getDb(DATABASE_STR).collection("users");

    try {
        const result = await users.insertOne({
            email,
            password: hashedPassword,
            createdAt: new Date()
        });

        return result;
    } catch (err) {
        // duplicate key error (unique index)
        if (err.code === 11000) {
            throw new Error("EMAIL_EXISTS");
        }
        throw err;
    }
}

async function findUserByEmail(email) {
    const users = db.getDb(DATABASE_STR).collection("users");
    return await users.findOne({ email });
}

module.exports = {
    init,
    createUser,
    findUserByEmail
};