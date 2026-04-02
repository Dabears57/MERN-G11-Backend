const express = require("express");
const router = express.Router();
const taskService = require("../services/tasks");

// TODO ADD USER ID FOR ALL METHODS

async function createTask(req, res){
    try{
        const { projectId, name, description } = req.body;

        if(!projectId || !name){
            return res.status(400).json({
                success: false,
                error: "missing fields: projectId or name",
                message: "missing required fields"
            });
        }

        const task = await taskService.createTask(
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
}

async function getTask(req, res){
    try{
        const searchQuery = req.body;

        const result = await taskService.findTask(searchQuery);

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
}

async function getTasks(req, res){
    try{
        const searchQuery = req.body;

        const result = await taskService.findTasks(searchQuery);

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
}

async function updateTask(req, res){
    try{
        const { id, update } = req.body;

        if(!id || !update){
            return res.status(400).json({
                success: false,
                error: "missing id or update object",
                message: "missing required fields"
            });
        }

        const result = await taskService.updateTask(id, update);

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
}

async function deleteTask(req, res){
    try{
        const { id } = req.body;

        if(!id){
            return res.status(400).json({
                success: false,
                error: "missing task id",
                message: "missing required field"
            });
        }

        const result = await taskService.deleteTask(id);

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
}

router.post("/create", createTask);
router.get("/fetch/one", getTask);
router.get("/fetch/many", getTasks);
router.put("/update", updateTask);
router.delete("/delete", deleteTask);

module.exports = router;