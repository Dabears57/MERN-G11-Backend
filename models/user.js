const db = require("../utils/mongo-utils");
const encryptUtil = require("../utils/encrypt-utils");

const DATABASE_STR = "development"; // should change this later 
const TOKEN_EXPIRE_TIME_MS = 1000 * 60 * 60; // 1 hour
const TOKEN_PASSWORD_EXPIRE_TIME_MS = 1000 * 60 * 5 // 5 minute

// lazy load the collection to reduce calls
let _collection = null;

function getCollection() {
    if (_collection) return _collection;

    const dbInstance = db.getDb(DATABASE_STR);

    if (!dbInstance) {
        throw new Error("DB not initialized");
    }

    _collection = dbInstance.collection("users");
    return _collection;
}

async function findUserByEmail(email) {
    return await getCollection().findOne({ email });
}

// create unique index (call once on startup)
async function init() {
    const users = getCollection();
    await users.createIndex({ email: 1 }, { unique: true });
}


// create user (production-safe)
/*
Handles creating the user in the database.
We will always expected a verification token since a new account will always need to be verified.
*/
async function createUser(email, firstName, hashedToken, hashedPassword) {
    const users = getCollection();
    try {
        const result = await users.insertOne({
            email,
            password: hashedPassword,
            firstName,
            verified: false,
            verificationTokenHash: hashedToken,
            verificationTokenExpires: Date.now() + TOKEN_EXPIRE_TIME_MS,
            createdAt: new Date()
        });

        return result;
    } catch (err) {
        console.log(err);

        const EXISTS_MONGO_ERROR_CODE = 11000;
        if (err.code === EXISTS_MONGO_ERROR_CODE) {
            throw new Error("EMAIL_EXISTS");
        }
        throw err;
    }
}

/*
attempts to find a user with this token and its not expired 
if it finds it it will update and verify it
*/
async function verifyUser(tokenHash) {
    const users = getCollection();

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
    const tokenHash = encryptUtil.hashToken(rawToken);

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
    const rawToken = encryptUtil.generateToken();
    // const hashedToken = encryptUtil.hashToken(rawToken);

    // Update user with new token & expiry
    // await users.updateOne(
    //     { _id: user._id },
    //     {
    //         $set: {
    //             verificationTokenHash: hashedToken,
    //             verificationTokenExpires: Date.now() + TOKEN_EXPIRE_TIME_MS,
    //         }
    //     }
    // );
    await setVerificationToken(user._id, rawToken);

    // Return the raw token for sending via email
    return rawToken;
}

async function generatePasswordResetToken(email){
    const users = getCollection();

    // Find user by email
    const user = await users.findOne({ email });
    if (!user){ 
        throw new Error("USER_NOT_FOUND");
    }

    // Generate new token
    const rawToken = encryptUtil.generateToken();
    const hashedToken = encryptUtil.hashToken(rawToken);

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

async function resetPassword(email, rawToken){

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
    regenerateVerificationToken,
    generatePasswordResetToken,
    resetPassword
};