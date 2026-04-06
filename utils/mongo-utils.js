const { MongoClient } = require("mongodb");

// singleton pattern where now we can access through a shared client
// instead of creating a new connection every time you want to access the DB
let _client;

// connects to mongodb and avoids duplicate clients
async function connect(url) {
    if (_client) return _client; 

    _client = new MongoClient(url);

    await _client.connect();

    console.log("MongoDB connected");
    return _client;
}

// grab database from mongo
function getDb(dbName) {
    if (!_client) {
        throw new Error("MongoDB not connected. Call connect() first.");
    }
    return _client.db(dbName);
}

function getCollectionGeneral(collection){
    const DATABASE_STR = "development";
    const dbInstance = getDb(DATABASE_STR);

    if (!dbInstance) {
        throw new Error("DB not initialized");
    }

    return dbInstance.collection(collection);
}

module.exports = {
    connect,
    getDb,
    getCollectionGeneral
};