const userModel = require("../models/user");
const jwtUtil = require("../utils/jwt-utils");
const encryptUtil = require("../utils/encrypt-utils");

// password helpers
async function hashPassword(plainPassword){
    const SALT_ROUNDS = 10;
    return await encryptUtil.saltString(plainPassword, SALT_ROUNDS);
}

async function checkPassword(plainPassword, hashedPassword){
    return await encryptUtil.compareSaltedString(plainPassword, hashedPassword);
}

function generateVerificationLink(rawVerifyToken){
    return `${process.env.APP_URL}/verify?token=${rawVerifyToken}`;
}

async function createUser(email, password, firstName){
    // hash password
    const hashedPassword = await hashPassword(password);

    // generate account verification tokens
    const rawVerifyToken = encryptUtil.generateToken();
    const hashVerifyToken = encryptUtil.hashToken(rawVerifyToken);

    await userModel.createUser(
        email,
        firstName,
        hashVerifyToken,
        hashedPassword,
    )

    return generateVerificationLink(rawVerifyToken);
}

async function verifyUser(rawVerifyToken){
    const tokenHash = encryptUtil.hashToken(rawVerifyToken);

    await userModel.verifyUser(tokenHash);
}

async function loginUser(email, password){
    // find user we are talking about
    const user = await userModel.findUserByEmail(email);
    if(!user){
        throw new Error("USER_NOT_FOUND"); 
    }

    // ensure we are verified
    userModel.assertVerified(user);

    // check password
    const validPassword = await checkPassword(password, user.password);
    if(!validPassword){
        throw new Error("INVALID_PASSWORD");
    }

    // build JWT login token
    const jwt = jwtUtil.generateToken(email, user.firstName);
    return jwt;
}

async function regenerateVerificationToken(email){
    const rawToken = await userModel.regenerateVerificationToken(email);
    return generateVerificationLink(rawToken);
}

module.exports = {
    createUser,
    verifyUser,
    loginUser,
    regenerateVerificationToken
};