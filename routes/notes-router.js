const express = require("express");
const router = express.Router();
const noteService = require("../services/notes");

// TODO ADD USER ID FOR ALL METHODS

async function createNote(req, res){
    try{
        const content = req.body.content;
        const parentType = req.body.parentType;
        const parentId = req.body.parentId;

        // validate we have params
        if(!content || !parentType || !parentId){
            return res.status(400).json({
                error: "missing information within body: content, parentType, or parentId"
            });
        }

        // create note
        const note = await noteService.createNote(
            content,
            parentType,
            parentId,
            new Date());

        return res.status(200).json({
            "note": note,
        });
    }catch(err){
        return res.status(500).json({error: err.message});
    }
}

async function getNote(req, res){
 try{
    const searchQuery = req.body;
    const result = noteService.findNote(searchQuery);

    return res.status(200).json({
        "res": result
    });
 }catch(err){
    return res.status(500).json({error: err.message});
 }
}

async function getNotes(req, res){
 try{
    const searchQuery = req.body;
    const result = noteService.findNotes(searchQuery);

    return res.status(200).json({
        "res": result
    });
 }catch(err){
    return res.status(500).json({error: err.message});
 }
}

async function deleteNote(req, res){
 try{

 }catch(err){
    return res.status(500).json({error: err.message});
 }
}

router.post("/create", createNote);
router.get("/fetch/one", getNote);
router.get("/fetch/many", getNotes);
router.delete("/delete", deleteNote);

module.exports = router;