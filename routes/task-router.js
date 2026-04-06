const express = require("express");
const router = express.Router();
const taskService = require("../services/tasks");
const authMiddleware = require("../middleware/authentication");

router.post("/create", authMiddleware, async (req,res)=>{
    try{
        const userId = req.user.userId;
        const { projectId, name, description } = req.body;

        if(!projectId || !name){
            return res.status(400).json({
                success: false,
                error: "missing fields: projectId or name",
                message: "missing required fields"
            });
        }

        const task = await taskService.createTask(
            userId,
            projectId,
            name,
            description
        );

        return res.status(200).json({
            success: true,
            data: task,
            message: "task created successfully"
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

        const result = await taskService.findTask(userId, searchQuery);

        return res.status(200).json({
            success: true,
            data: result,
            message: "task fetched successfully"
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

        const result = await taskService.findTasks(userId, searchQuery);

        return res.status(200).json({
            success: true,
            data: result,
            message: "tasks fetched successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
});

router.put("/update",authMiddleware,async (req,res)=>{
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

        const result = await taskService.updateTask(userId, id, update);

        return res.status(200).json({
            success: true,
            data: result,
            message: "task updated successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
});

router.delete("/delete",authMiddleware, async (req,res)=>{
    try{
        const userId = req.user.userId;
        const { id } = req.body;

        if(!id){
            return res.status(400).json({
                success: false,
                error: "missing task id",
                message: "missing required field"
            });
        }

        const result = await taskService.deleteTask(userId, id);

        return res.status(200).json({
            success: true,
            data: result,
            message: "task deleted successfully"
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