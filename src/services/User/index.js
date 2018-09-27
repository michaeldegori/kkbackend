const UserModelFactory = require('./model.js');

module.exports = function(app, db){
    const User = UserModelFactory(db);

    app.get('/user/finishRegistration', (req, res) => {

    });

    /**
     * GET user data by id
     */
    app.get('/user/:id', (req, res) => {

    });

    /**
     * Update any field in user model
     */
    app.patch('/user/:id', (req, res) => {

    });
};