const userModel = require("../models/user");
const jwtUtil = require("../utils/jwt-utils");
const encryptUtil = require("../utils/encrypt-utils");
const emailUtil = require("../utils/email-utils");

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

function generatePasswordResetLink(email, rawPasswordToken){
    return `${process.env.APP_URL}/reset-password?email=${email}&token=${rawPasswordToken}`
}

async function sendVerificationEmail(toEmail, verificationLink){
    await emailUtil.userSendAccountVerificationEmail(toEmail, verificationLink);
}

async function sendPasswordResetEmail(toEmail, verificationLink){
    await emailUtil.userSendPasswordResetEmail(toEmail, verificationLink);
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
    const jwt = jwtUtil.generateToken(user._id, email, user.firstName);
    return jwt;
}

async function regenerateVerificationToken(email){
    const rawToken = await userModel.regenerateVerificationToken(email);
    return generateVerificationLink(rawToken);
}

async function generatePasswordResetToken(email){
    const rawToken = await userModel.generatePasswordResetToken(email);
    return generatePasswordResetLink(email, rawToken);
}

async function resetPassword(email, token, newPassword){
    const tokenHash = encryptUtil.hashToken(token);
    const hashedPassword = await hashPassword(newPassword);

    await userModel.resetPassword(email, hashedPassword, tokenHash);
}

module.exports = {
    createUser,
    verifyUser,
    loginUser,
    regenerateVerificationToken,
    generatePasswordResetToken,
    resetPassword,
    sendVerificationEmail,
    sendPasswordResetEmail
};