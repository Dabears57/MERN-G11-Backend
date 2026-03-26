const express = require("express");
const router = express.Router();
const controller = require('../controllers/user');

router.post("/create", controller.createUser);

module.exports = router;