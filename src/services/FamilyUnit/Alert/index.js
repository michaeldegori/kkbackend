const mongoose = require('mongoose');

exports.routeFactory = async function (app, User, FamilyUnit, Alert){
    app.get('/familyunit/:unitid/alerts', async (req, res) => {
        if (!req.user || !req.user.sub) return res.status(400).json({Err: 'no token'});
        try {
            let [currentUser, familyUnit] = await Promise.all([
                User.findOne({auth0ID: req.user.sub}),
                FamilyUnit.findOne({_id: req.params.unitid})
            ]);
            if (!currentUser) return res.status(400).json({message: "Incorrect user token"});
            if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});
            if (!familyUnit.adminsList.includes(currentUser.email))
                return res.status(403).json({message: "Current user token does not have access to family unit id " + req.params.id});

            const alerts = await Alert.find({familyUnit: req.params.unitid});
            console.log(alerts);
            res.json(alerts);
        }
        catch(err){
            console.log(err);
            res.status(500).json({err})
        }

    });

    app.post('/familyunit/:unitid/alerts', async (req, res) => {

        const {kid, chore} = req.body;
        if (!kid || !chore) return res.status(400).json({Err: 'missing kid or chore'});

        try {
            let [currentUser, familyUnit] = await Promise.all([
                User.findOne({auth0ID: req.user.sub}),
                FamilyUnit.findOne({_id: req.params.unitid})
            ]);
            if (!currentUser) return res.status(400).json({message: "Incorrect user token"});
            if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});
            if (!familyUnit.adminsList.includes(currentUser.email))
                return res.status(403).json({message: "Current user token does not have access to family unit id " + req.params.id});

            const alert = new Alert({
                ...req.body,
                familyUnit: familyUnit._id,
                timeStamp: new Date().getTime()
            });
            const saveResult = await alert.save();
            res.json(saveResult);
        }
        catch(err){
            console.log(err);
            res.status(500).json({err})
        }
    });


    /**
     * default data
     */
    let [a1,a2,a3,a4] = await Promise.all([
        Alert.findOne({_id: '5bb6f007c4e3fbec666f63b9'}),
        Alert.findOne({_id: '5bb6f007c4e3fbec777f63b9'}),
        Alert.findOne({_id: '5bb6f007c4e3fbec888f63b9'}),
        Alert.findOne({_id: '5bb6f007c4e3fbec999f63b9'})
    ]);
    if (a1 || a2 || a3 || a4) return;

    let [unit1, unit2] = await Promise.all([
        FamilyUnit.findOne({adminsList: 'marjvic@gmail.com'}),
        FamilyUnit.findOne({adminsList: 'vic2@kk.com'})
    ]);

    if (unit1){
        a1 = new Alert({
            _id: new mongoose.Types.ObjectId('5bb6f007c4e3fbec666f63b9'),
            familyUnit: unit1._id,
            kid: getFirstKid(unit1),
            chore: getFirstChore(unit1),
            timeStamp: new Date().getTime()-60*15*1000,
            customNote: "This is a custom note",
            isTappable: false,
            status: "new"
        });
        a1.save().then(console.log);

        a2 = new Alert({
            _id: new mongoose.Types.ObjectId('5bb6f007c4e3fbec777f63b9'),
            familyUnit: unit1._id,
            kid: getFirstKid(unit1),
            chore: getFirstChore(unit1),
            timeStamp: new Date().getTime(),
            customNote: "This is a custom note",
            isTappable: false,
            status: "new"
        });
        a2.save().then(console.log);
    }

    if (unit2) {
        a3 = new Alert({
            _id: new mongoose.Types.ObjectId('5bb6f007c4e3fbec888f63b9'),
            familyUnit: unit2._id,
            kid: getFirstKid(unit1),
            chore: getFirstChore(unit1),
            timeStamp: new Date().getTime()-60*15*1000,
            customNote: "This is a custom note",
            isTappable: false,
            status: "new"
        });
        a3.save().then(console.log);

        a4 = new Alert({
            _id: new mongoose.Types.ObjectId('5bb6f007c4e3fbec999f63b9'),
            familyUnit: unit2._id,
            kid: getFirstKid(unit1),
            chore: getFirstChore(unit1),
            timeStamp: new Date().getTime(),
            customNote: "This is a custom note",
            isTappable: false,
            status: "new"
        });
        a4.save().then(console.log);
    }
};


function getFirstKid(familyUnit){
    if (!familyUnit.kidsList || familyUnit.kidsList.length === 0) return null;
    return familyUnit.kidsList[0]._id;
}
function getFirstChore(familyUnit){
    if (!familyUnit.existingChores || familyUnit.existingChores.length === 0) return null;
    return familyUnit.existingChores[0]._id;
}

module.exports = exports;