const familyUnitModelFactory = require('./model.js');

module.exports = function(app, db){
    const FamilyUnit = familyUnitModelFactory(db);

    /**
     * Get family unit pertaining to user id of main logged in user, including chores and rewards available
     */
    app.get('/familyunit/:userid', (req, res) => {

    });

    /**
     * create chore
     */
    app.post('/familyunit/:unitid/createchore', (req, res) => {

    });

    /**
     * create reward
     */
    app.post('/familyunit/:unitid/createreward', (req, res) => {

    });

    /**
     * add child to family unit: {firstName, avatar, userType='child', kiddieKash}
     * gotta think this through better
     */
    app.post('/familyunit/:unitid/addchild', (req, res) => {

    });
};