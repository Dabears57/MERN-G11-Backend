const express = require("express");
const router = express.Router();
const sessionService = require("../services/sessions");

// START SESSION
async function createSession(req, res){
    try{
        const { projectId } = req.body;

        if(!projectId){
            return res.status(400).json({
                error: "missing projectId"
            });
        }

        const session = await sessionService.createSession(projectId);

        return res.status(200).json({ session });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

// STOP SESSION
async function stopSession(req, res){
    try{
        const { id } = req.body;

        if(!id){
            return res.status(400).json({
                error: "missing session id"
            });
        }

        const result = await sessionService.stopSession(id);

        return res.status(200).json({ result });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function getSession(req, res){
    try{
        const searchQuery = req.body;

        const result = await sessionService.findSession(searchQuery);

        return res.status(200).json({ result });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function getSessions(req, res){
    try{
        const searchQuery = req.body;

        const result = await sessionService.findSessions(searchQuery);

        return res.status(200).json({ result });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function deleteSession(req, res){
    try{
        const { id } = req.body;

        if(!id){
            return res.status(400).json({
                error: "missing session id"
            });
        }

        const result = await sessionService.deleteSession(id);

        return res.status(200).json({ result });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

router.post("/create", createSession);
router.post("/stop", stopSession);
router.get("/fetch/one", getSession);
router.get("/fetch/many", getSessions);
router.delete("/delete", deleteSession);

module.exports = router;