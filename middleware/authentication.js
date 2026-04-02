const jwtUtil = require("../utils/jwt-utils");

function authMiddleware(req, res, next) {
    const token =
        req.cookies?.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token){
        return res.status(401).json({
            success: false,
            error: "unauthorized, missing a auth cookie or authorization header",
            message: "unauthorized, missing a auth cookie or authorization header"
        });
    }

    try {
        const user = jwtUtil.verifyToken(token)
        req.user = user;
        next();
    } catch {
        res.status(401).send({
            success: false,
            error: "Invalid token",
            message: "invalid or malformed token please relogin"
        });
    }
}

module.exports = authMiddleware;