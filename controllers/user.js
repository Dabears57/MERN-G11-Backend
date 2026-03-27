const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const jwtUtil = require("../utils/jwt-utils");

// salts a password 
async function saltPassword(plainPassword){
    const SALT_ROUNDS = 10;
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

// returns true or false
async function compareSaltedPassword(plainPassword, hashedPassword){
    return await bcrypt.compare(plainPassword, hashedPassword);
}

/*
We should expect when a user is being created:
email and password.
*/
async function createUser(req, res){
    try {
        const email = req.body.email;
        const password = req.body.password;

        // verification
        if(!email || !password) {
            return res.status(400).json({error: "Email and Password is required"});
        }

        // salt password for security
        const hashedPassword = await saltPassword(password);

        // attempt to create user (this handles the duplicate email)
        await userModel.createUser(email, hashedPassword);

        return res.status(200).json({
            message: "user created!"
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function loginUser(req, res){
    try{
        const email = req.body.email;
        const password = req.body.password;

         // verification
        if(!email || !password) {
            return res.status(400).json({error: "Email and Password is required"});
        }

        // find user
        user = await userModel.findUserByEmail(email);
        if(!user){
            return res.status(404).json({
                message: "no user found with that email"
            });
        }

        // check to see if it is the right password
        valid_password = await compareSaltedPassword(password, user.password);
        if(!valid_password){
            return res.status(403).json({
                message: "incorrect password"
            });
        }

        jwt = jwtUtil.generateToken(email);

        return res.status(200).json({
            token: jwt
        });

    }catch(err){
        return res.status(500).json({error: err.message});
    }
}

module.exports = {
    createUser,
    loginUser
}