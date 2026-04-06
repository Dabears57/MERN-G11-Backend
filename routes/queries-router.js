// routes/query.js
const express = require("express");
const router = express.Router();
const queryService = require("../services/queries");
const auth = require("../middleware/authentication");
const { ObjectId } = require("mongodb");

// Project full view
router.get("/project/:id", auth, async (req, res) => {
  try{
    const projectId = new ObjectId(req.params.id);
    const data = await queryService.getFullProject(projectId);
    if (!data) return res.status(404).json({ success: false });

    res.json({ success: true, data });
  }catch(err){
    return res.status(500).json({
        success: false,
        error: err.message,
        message: "unknown error"
    });
  }
});

// Session full view
router.get("/session/:id", auth, async (req, res) => {
  try{
    const sessionId = new ObjectId(req.params.id);
    const data = await queryService.getFullSession(sessionId);
    if (!data) return res.status(404).json({ success: false });

    res.json({ success: true, data });
  }catch(err){
    return res.status(500).json({
        success: false,
        error: err.message,
        message: "unknown error"
    });
  }
});

// Metadata endpoints
router.get("/sessions", auth, async (req, res) => {
  try{
    const data = await queryService.listSessionMetadata(req.user.userId);
    res.json({ success: true, data });
  }catch(err){
    return res.status(500).json({
        success: false,
        error: err.message,
        message: "unknown error"
    });
  }
});

router.get("/projects", auth, async (req, res) => {
  try{
    const data = await queryService.listProjectMetadata(req.user.userId);
    res.json({ success: true, data });
  }catch(err){
    return res.status(500).json({
        success: false,
        error: err.message,
        message: "unknown error"
    });
  }
});

router.get("/tasks", auth, async (req, res) => {
  try{
    const data = await queryService.listTaskMetadata(req.user.userId);
    res.json({ success: true, data });
  }catch(err){
    return res.status(500).json({
        success: false,
        error: err.message,
        message: "unknown error"
    });
  }
});

module.exports = router;