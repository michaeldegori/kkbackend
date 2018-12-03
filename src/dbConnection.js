const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
let connectionString = null;
try {
    config = require("../config/database.js");
    connectionString = config.database;
} catch (e) {
    console.log("error reading or parsing db config file", e);
}

const connection = mongoose.createConnection(connectionString, {useNewUrlParser: true});

module.exports = connection;