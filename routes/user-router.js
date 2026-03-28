const express = require("express");
const router = express.Router();
const controller = require('../controllers/user');

router.post("/create", controller.createUser);
router.post("/login", controller.loginUser);
router.post("/verify", controller.verifyAccount);
router.post("/verify/regen", controller.regenerateVerificationToken);

module.exports = router;