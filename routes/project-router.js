const express = require("express");
const router = express.Router();
const projectService = require("../services/projects");
const authMiddleware = require("../middleware/authentication");

router.post("/create", authMiddleware, async (req, res)=>{
    try{
        const userId = req.user.userId;
        const { title, description} = req.body;

        if(!title || !description){
            return res.status(400).json({
                success: false,
                error: "missing fields: title, description",
                message: "missing required fields"
            });
        }

        const project = await projectService.createProject(
            title,
            description,
            userId
        );

        return res.status(200).json({
            success: true,
            data: project,
            message: "project created successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
});

router.post("/fetch/one", authMiddleware, async (req,res)=>{
    try{
        const userId = req.user.userId;
        const searchQuery = req.body;

        const result = await projectService.findProject(userId, searchQuery);

        return res.status(200).json({
            success: true,
            data: result,
            message: "project fetched successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
});

router.post("/fetch/many", authMiddleware, async (req, res)=>{
    try{
        const userId = req.user.userId;
        const searchQuery = req.body;

        const result = await projectService.findProjects(userId, searchQuery);

        return res.status(200).json({
            success: true,
            data: result,
            message: "projects fetched successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
});

router.put("/update", authMiddleware, async (req, res)=>{
    try{
        const userId = req.user.userId;
        const { id, update } = req.body;

        if(!id || !update){
            return res.status(400).json({
                success: false,
                error: "missing id or update object",
                message: "missing required fields"
            });
        }
        if(update.userId || update._id){
            return res.status(400).json({
                success: false,
                error: "invalid update felid: userId, _id",
                message: "invalid update felid: userId, _id"
            });
        }

        const result = await projectService.updateProject(userId, id, update);

        return res.status(200).json({
            success: true,
            data: result,
            message: "project updated successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
});

router.delete("/delete", authMiddleware, async (req, res)=>{
    try{
        const userId = req.user.userId;
        const { id } = req.body;

        if(!id){
            return res.status(400).json({
                success: false,
                error: "missing project id",
                message: "missing required field"
            });
        }

        const result = await projectService.deleteProject(userId, id);

        return res.status(200).json({
            success: true,
            data: result,
            message: "project deleted successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
});

module.exports = router;