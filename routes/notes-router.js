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

        const result = await noteService.deleteNote(id);

        return res.status(200).json({
            success: true,
            data: result,
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

router.post("/create", createNote);
router.get("/fetch/one", getNote);
router.get("/fetch/many", getNotes);
router.delete("/delete", deleteNote);

module.exports = router;