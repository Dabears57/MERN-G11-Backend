const express = require("express");
const router = express.Router();
const projectService = require("../services/projects");

// TODO ADD USER ID FOR ALL METHODS

async function createProject(req, res){
    try{
        const { title, description, id} = req.body;

        if(!title || !description || !id){
            return res.status(400).json({
                error: "missing fields: title or description"
            });
        }

        const project = await projectService.createProject(
            title,
            description,
            id
        );

        return res.status(200).json({ project });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function getProject(req, res){
    try{
        const searchQuery = req.body;

        const result = await projectService.findProject(searchQuery);

        return res.status(200).json({ result });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function getProjects(req, res){
    try{
        const searchQuery = req.body;

        const result = await projectService.findProjects(searchQuery);

        return res.status(200).json({ result });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function updateProject(req, res){
    try{
        const { id, update } = req.body;

        if(!id || !update){
            return res.status(400).json({
                error: "missing id or update object"
            });
        }

        const result = await projectService.updateProject(id, update);

        return res.status(200).json({ result });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function deleteProject(req, res){
    try{
        const { id } = req.body;

        if(!id){
            return res.status(400).json({
                error: "missing project id"
            });
        }

        const result = await projectService.deleteProject(id);

        return res.status(200).json({ result });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

// ROUTES
router.post("/create", createProject);
router.get("/fetch/one", getProject);
router.get("/fetch/many", getProjects);
router.put("/update", updateProject);
router.delete("/delete", deleteProject);

module.exports = router;