const authMiddleware = require("../middleware/authentication");
const express = require("express");
const router = express.Router();
const sessionService = require("../services/sessions");

// START SESSION
async function createSession(req, res){
    try{
        const { projectId } = req.body;
        const userId = req.user.userId;

        if(!projectId){
            return res.status(400).json({
                success: false,
                error: "missing projectId",
                message: "missing required field"
            });
        }

        const session = await sessionService.createSession(userId, projectId);
        if(!session){
            return res.status(400).json({
                success: false,
                error: "failed to create session. Active session.",
                message: "failed to create session. Active session."
            })
        }

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

/*
To get the status of an active session:
3 possible returns:
-------------------
1. paused and paused time
2. in-progress and time
3. no active session 
*/
async function sessionStatus(req, res){
    try{
        const userId = req.user.userId; 

        const result = await sessionService.getStatus(userId);

        return res.status(200).json({
            success: true,
            data: result,
            message: "fetched status!"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

async function startSession(req, res){
    try{
        const userId = req.user.userId;

        const result = await sessionService.resumeSession(userId);
        if(!result){
            return res.status(404).json({
                "success": false,
                "error": "could not find active session",
                "message": "could not find active session"
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
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

async function pauseSession(req, res){
    try{
        const userId = req.user.userId;

        const result = await sessionService.pauseSession(userId);
        if(!result){
            return res.status(404).json({
                "success": false,
                "error": "could not find active session",
                "message": "could not find active session"
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
            message: "session paused successfully"
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
        const userId = req.user.userId;

        const result = await sessionService.stopSession(userId);
        if(!result){
            return res.status(404).json({
                "success": false,
                "error": "could not find active session",
                "message": "could not find active session"
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
            message: "session paused successfully"
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

router.post("/create", authMiddleware, createSession);

router.get("/start", authMiddleware, startSession);
router.get("/pause", authMiddleware, pauseSession);
router.get("/stop", authMiddleware, stopSession);

router.get("/fetch/one", authMiddleware, getSession);
router.get("/fetch/many", authMiddleware, getSessions);
router.get("/status", authMiddleware, sessionStatus);
router.delete("/delete", authMiddleware, deleteSession);


module.exports = router;