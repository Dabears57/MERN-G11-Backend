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

// start server wait for mongodb connection
async function startup(){
    // database init
    await mongo_utils.connect(MONGODB_URI);
    await userModel.init();

    app.listen(PORT, async (req,res)=>{
        console.log(`server online! Running Port ${PORT}`);
    });
}

startup();