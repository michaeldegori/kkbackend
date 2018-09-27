const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const db = require('./src/dbConnection.js');

app.get('/healthcheck', (req, res) => res.end("health check succeeded"));


//routes
require('./src/services/User')(app, db);


app.listen(PORT);

