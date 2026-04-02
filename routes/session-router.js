const express = require("express");
const router = express.Router();
const sessionService = require("../services/sessions");

// START SESSION
async function createSession(req, res){
    try{
        const { projectId } = req.body;

        if(!projectId){
            return res.status(400).json({
                success: false,
                error: "missing projectId",
                message: "missing required field"
            });
        }

        const session = await sessionService.createSession(projectId);

        return res.status(200).json({
            success: true,
            data: session,
            message: "session started successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

// STOP SESSION
async function stopSession(req, res){
    try{
        const { id } = req.body;

        if(!id){
            return res.status(400).json({
                success: false,
                error: "missing session id",
                message: "missing required field"
            });
        }

        const result = await sessionService.stopSession(id);

        return res.status(200).json({
            success: true,
            data: result,
            message: "session stopped successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

async function getSession(req, res){
    try{
        const searchQuery = req.body;

        const result = await sessionService.findSession(searchQuery);

        return res.status(200).json({
            success: true,
            data: result,
            message: "session fetched successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

async function getSessions(req, res){
    try{
        const searchQuery = req.body;

        const result = await sessionService.findSessions(searchQuery);

        return res.status(200).json({
            success: true,
            data: result,
            message: "sessions fetched successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

async function deleteSession(req, res){
    try{
        const { id } = req.body;

        if(!id){
            return res.status(400).json({
                success: false,
                error: "missing session id",
                message: "missing required field"
            });
        }

        const result = await sessionService.deleteSession(id);

        return res.status(200).json({
            success: true,
            data: result,
            message: "session deleted successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

router.post("/create", createSession);
router.post("/stop", stopSession);
router.get("/fetch/one", getSession);
router.get("/fetch/many", getSessions);
router.delete("/delete", deleteSession);

module.exports = router;