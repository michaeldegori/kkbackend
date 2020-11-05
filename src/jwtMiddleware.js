const jwt = require('express-jwt');
const fs = require('fs');

const jwtValidationMiddleware = jwt({
    secret: fs.readFileSync(__dirname + '/../config/.cert.pem'),
    issuer: 'https://kiddiekredit.auth0.com/',
    audience: 'LVfVnJg9zngBlm5fIPkAPsZO5wyveh1z',
    algorithms: [ 'RS256', 'RS512' ]
});

const openPaths = [
    "/healthcheck",
    // "/advert",
    "/favicon.ico",
    "/",
    "/logout",
];

const fullopenRoutes = [
    "/pushnotification",
    "/advert"
];


module.exports = function(req, res, next) {
    if (
        openPaths.includes(req.originalUrl) ||
            fullopenRoutes.some(element => req.originalUrl.indexOf(element) === 0)
    ){
        console.log("Skipping the jwt validation for " + req.originalUrl);
        return next();
    }
    jwtValidationMiddleware(req,res,next);
};