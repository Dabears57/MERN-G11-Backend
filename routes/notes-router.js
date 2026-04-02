const express = require("express");
const router = express.Router();
const noteService = require("../services/notes");

// TODO ADD USER ID FOR ALL METHODS

async function createNote(req, res){
    try{
        const { content, parentType, parentId } = req.body;

        if(!content || !parentType || !parentId){
            return res.status(400).json({
                success: false,
                error: "missing information within body: content, parentType, or parentId",
                message: "missing required fields"
            });
        }

        const note = await noteService.createNote(
            req.user.userId,
            content,
            parentType,
            parentId,
            new Date()
        );

        return res.status(200).json({
            success: true,
            data: note,
            message: "note created successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

async function getNote(req, res){
    try{
        const searchQuery = req.body;

        // force the searchQuery to have the userId tied to it
        searchQuery.userId = req.user.userId;

        const result = await noteService.findNote(searchQuery);

        return res.status(200).json({
            success: true,
            data: result,
            message: "note fetched successfully"
        });
    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

async function getNotes(req, res){
    try{
        const searchQuery = req.body;

        // force the searchQuery to have the userId tied to it
        searchQuery.userId = req.user.userId;

        const result = await noteService.findNotes(searchQuery);

        return res.status(200).json({
            success: true,
            data: result,
            message: "notes fetched successfully"
        });
    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

// THE SERVICE IS NOT IMPLEMENTED YET THIS IS JUST AN OUTLINE
async function deleteNote(req, res){
    try{
        const { id } = req.body;

        if(!id){
            return res.status(400).json({
                success: false,
                error: "missing note id",
                message: "missing required field"
            });
        }

        // pull userId
        const userId = req.user.userId;

        const deletedCount = await noteService.deleteNote(userId, id);
        if(deletedCount == null){
            throw new Error("unexpected null deleteCount"); 
        }

        if(deletedCount==0){
            return res.status(404).json({
                success: false,
                error: "did not find note to delete", 
                message: "did not find note to delete", 
            })
        }

        return res.status(200).json({
            success: true,
            data: null,
            message: "note deleted successfully"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

// helper function which allows the database 
// to control what is and isn't a valid parent type
async function getParentTypes(req, res){
    try{
        const result = await noteService.findParentTypes();
        console.log(result);

        return res.status(200).json({
            success: true,
            data: result,
            message: "parent types successful fetched"
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "unknown error"
        });
    }
}

const authMiddleware = require("../middleware/authentication");

router.post("/create", authMiddleware, createNote);
router.post("/fetch/one", authMiddleware, getNote);
router.post("/fetch/many", authMiddleware, getNotes);

router.get("/fetch/types", getParentTypes);

router.delete("/delete", authMiddleware, deleteNote);

module.exports = router;