const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const db = require('./src/dbConnection.js');
const bp = require('body-parser');

//models instantiated
const User = require('./src/services/User/model.js')(db);
const FamilyUnit = require('./src/services/FamilyUnit/model.js')(db);

//middlewares and health check
app.use(bp.json());
app.get('/healthcheck', (req, res) => res.end("health check succeeded"));
app.use(require('./src/jwtMiddleware.js'));


//routes
require('./src/services/User')(app, User, FamilyUnit);
require('./src/services/FamilyUnit')(app, User, FamilyUnit);


app.listen(PORT);

