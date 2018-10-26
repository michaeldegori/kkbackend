const express = require('express');
const http = require('http');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 4000;
const db = require('./src/dbConnection.js');
const bp = require('body-parser');
const cors = require('cors');

//models instantiated
const User = require('./src/services/User/model.js')(db);
const FamilyUnit = require('./src/services/FamilyUnit/model.js')(db);
const Chore = require('./src/services/DefaultChore/model').modelFactory(db);
const Reward = require('./src/services/DefaultReward/model').modelFactory(db);

//middlewares and health check
app.use(cors());
app.use(bp.json());
app.use(function(req, res, next){
    console.log(`${req.method} ${req.originalUrl} - Authorization: ${!!req.get('Authorization')}`);
    console.log('Query', req.query);
    console.log('Body', req.body);
    next();
});
app.get('/healthcheck', (req, res) => {
    console.log('received health check');
    res.end("health check succeeded");
});
app.use(require('./src/jwtMiddleware.js'));

//routes
require('./src/services/User')(app, User, FamilyUnit);
require('./src/services/FamilyUnit')(app, User, FamilyUnit, Chore, Reward);
require('./src/services/DefaultChore').routeFactory(app, User, Chore);
require('./src/services/DefaultReward').routeFactory(app, User, Reward);


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

