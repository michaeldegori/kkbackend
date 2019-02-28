const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const db = require('./src/dbConnection.js');
const bp = require('body-parser');
const cors = require('cors');

//models instantiated
const User = require('./src/services/User/model.js')(db);
const FamilyUnit = require('./src/services/FamilyUnit/model.js')(db);
const Chore = require('./src/services/DefaultChore/model').modelFactory(db);
const ChoreSuggestion = require('./src/services/DefaultChore/model').suggestionModelFactory(db);
const Reward = require('./src/services/DefaultReward/model').modelFactory(db);
const Alert = require('./src/services/FamilyUnit/Alert/model').modelFactory(db);
const ParentDashboardEI = require('./src/services/EducationalInfo/model').parentInfoModelFactory(db);
const KidDashboardEI = require('./src/services/EducationalInfo/model').kidInfoModelFactory(db);

const sendPushNotification = require('./src/services/SendPushNotification.js');

//middlewares and health check
if (process.env.NODE_ENV === 'production') app.all('*', ensureSecure);
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
app.get('/logout', (req, res) => {
   res.sendFile(__dirname+ '/src/files/logout.html');
});
app.get('/pushnotification/:userid', async (req, res) => {
    const targetUser = User.findOne({_id: req.params.userid});
    if (!targetUser)
        return res.status(404).json({err: 'User not found'});
    if (!targetUser.pushNotificationInformation || !targetUser.pushNotificationInformation.expo || !targetUser.pushNotificationInformation.expo.map)
        return res.status(404).json({err: 'User does not have any push token associated'});

    const receipts = await sendPushNotification(
        targetUser.pushNotificationInformation.expo.map(subscription => subscription.token),
        "Test of the push notification system. Thug life."
    );
    res.json({receipts});
});

require('./src/services/User')(app, User, FamilyUnit);
require('./src/services/FamilyUnit')(app, User, FamilyUnit, Chore, Reward, Alert);
require('./src/services/DefaultChore').routeFactory(app, User, ChoreSuggestion);
require('./src/services/DefaultReward').routeFactory(app, User, Reward);
require('./src/services/FamilyUnit/Alert').routeFactory(app, User, FamilyUnit, Alert);
require('./src/services/EducationalInfo').routeFactory(app, User, ParentDashboardEI, KidDashboardEI);

let httpsOptions = {};
if (process.env.NODE_ENV === 'production'){
    httpsOptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/api.kiddiekredit.com/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/api.kiddiekredit.com/fullchain.pem'),
        ca: fs.readFileSync('/etc/letsencrypt/live/api.kiddiekredit.com/chain.pem')
    };
    https.createServer(httpsOptions, app).listen(PORT, ()=>listenCB(PORT));
    http.createServer(app).listen(8080, ()=>listenCB(8080));
}
else{
    app.listen(PORT, ()=>listenCB(PORT));
}


function listenCB(port){
    console.log("Web server listening on port " + port);
}

function ensureSecure(req, res, next){
    if(req.secure){
        // OK, continue
        return next();
    };
    // handle port numbers if you need non defaults
    // res.redirect('https://' + req.host + req.url); // express 3.x
    res.redirect('https://' + req.hostname + req.url); // express 4.x
};