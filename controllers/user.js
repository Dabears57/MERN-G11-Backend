const bcrypt = require("bcrypt");
const userModel = require("../models/user");

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
exports.createUser = async function (req, res){
    try {
        const email = req.body.email;
        const password = req.body.password;

        // verification
        if(!email || !password) {
            return res.status(400).json({error: "Email and Password is required"});
        }

        // salt password for security
        const hashedPassword = await saltPassword(password);

        console.log(await userModel.createUser(email, hashedPassword));

        return res.status(200).json({
            message: "User created",
            hashedPassword // remove this in production
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}