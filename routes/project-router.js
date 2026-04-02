const express = require("express");
const router = express.Router();
const projectService = require("../services/projects");

// TODO ADD USER ID FOR ALL METHODS

async function createProject(req, res){
    try{
        const { title, description, id } = req.body;

        if(!title || !description || !id){
            return res.status(400).json({
                success: false,
                error: "missing fields: title, description, or id",
                message: "missing required fields"
            });
        }

        const project = await projectService.createProject(
            title,
            description,
            id
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
}

async function getProject(req, res){
    try{
        const searchQuery = req.body;

        const result = await projectService.findProject(searchQuery);

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
}

async function getProjects(req, res){
    try{
        const searchQuery = req.body;

        const result = await projectService.findProjects(searchQuery);

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
}

async function updateProject(req, res){
    try{
        const { id, update } = req.body;

        if(!id || !update){
            return res.status(400).json({
                success: false,
                error: "missing id or update object",
                message: "missing required fields"
            });
        }

        const result = await projectService.updateProject(id, update);

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
}

async function deleteProject(req, res){
    try{
        const { id } = req.body;

        if(!id){
            return res.status(400).json({
                success: false,
                error: "missing project id",
                message: "missing required field"
            });
        }

        const result = await projectService.deleteProject(id);

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
}

// ROUTES
router.post("/create", createProject);
router.get("/fetch/one", getProject);
router.get("/fetch/many", getProjects);
router.put("/update", updateProject);
router.delete("/delete", deleteProject);

module.exports = router;