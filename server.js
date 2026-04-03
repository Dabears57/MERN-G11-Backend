const express = require('express');
const dotenv = require('dotenv').config();
const mongo_utils = require('./utils/mongo-utils');

const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// grab env variables  
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

// use api router 
const apiRouter = require('./routes/api-router');
app.use("/api", apiRouter);

// models
const userModel = require("./models/user");
const sessionModel = require("./models/sessions");

// start server wait for mongodb connection
async function startup(){
    // database init
    console.log("starting up server...");
    console.log("attempting to connect to mongodb");
    await mongo_utils.connect(MONGODB_URI);

    console.log("initializing models...");

    // init databases in parallel
    await Promise.all([
        userModel.init(),
        sessionModel.init(),
    ]);

    console.log("models are initialized.");

    app.listen(PORT, async (req,res)=>{
        console.log(`server online! Running Port ${PORT}`);
    });
}

startup();