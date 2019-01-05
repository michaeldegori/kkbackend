const {isValidChore}  = require("../DefaultChore");
const {RRule} = require('rrule');
const {Types: {ObjectId, Mixed}} = require('mongoose');
const {createAlertWithPush} = require('./Alert/index.js');
const mongoose = require('mongoose');

module.exports = function(app, User, FamilyUnit, Chore, Reward, Alert){
    /**
     * Get family unit pertaining to user id of main logged in user,
     * including chores and rewards available
     */
    app.get('/familyunit', async (req, res) => {
        if (!req.user || !req.user.sub) return res.status(403).json({Err: 'no token'});
        try{
            let currentUser = await User.findOne({auth0ID: req.user.sub});
            if (!currentUser) return res.status(400).json({message: "Incorrect user token"});

            const familyUnit = await FamilyUnit.findOne({adminsList: currentUser.email});
            let familyAdminPromises = [];
            if (familyUnit.adminsList.length > 0)
                familyAdminPromises = familyAdminPromises
                    .concat(
                        familyUnit.adminsList.map(
                            parentEmail => User.findOne({email: parentEmail})
                        )
                    );

            let familyAdmins = await Promise.all(familyAdminPromises);
            familyAdmins = familyAdmins.map((admin, idx) => admin || familyUnit.adminsList[idx])

            const familyUnitObj = familyUnit.toObject();

            res.json({
                familyUnit: {
                    ...familyUnitObj,
                    adminsList: familyAdmins
                },
                currentUser
            });
        }
        catch(err){
            console.log(err);
            res.json({err: err.message});
        }


    });

    /**
     * create chore
     *
     */
    app.post('/familyunit/:unitid/chore', async (req, res) => {
        const choreData = req.body;
        if (!isValidChore(choreData)) return res.status(400).json({message: "Invalid chore data"});
        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        const rruleConfig = {
            freq: RRule[req.body.freq],
            interval: 1,
            byweekday: req.body.weekdays.map(day => RRule[day]),
            dtstart: new Date(),
            until: new Date(Date.UTC(2100, 12, 31))
        };
        if (rruleConfig.freq === RRule.MONTHLY){
            rruleConfig.bysetpos = choreData.monthlyChoreInterval || 1;
        }
        const newChore = new Chore({
            _id: new ObjectId(),
            name: req.body.name,
            priority: req.body.priority,
            kkReward: req.body.kkReward,
            notes: req.body.notes,
            repetitionRule: new RRule(rruleConfig),
            startDate: new Date().getTime(),
            endDate: 4105161000000,
            paused: false,
        });

        familyUnit.existingChores.push(newChore);
        //need to add the chores to the kids too
        if (choreData.choreAppliedTo && choreData.choreAppliedTo.length > 0) {
            familyUnit.kidsList.forEach(kid => {
                if (choreData.choreAppliedTo.includes(kid._id.toString())){
                    kid.assignedChores.push(newChore._id);
                }
            })
        }

        const saveResult = await familyUnit.save();
        console.log(saveResult);
        res.json(saveResult);
    });

    /**
     * update chore
     *
     */
    app.put('/familyunit/:unitid/chore/:choreid', async (req, res) => {
        const choreData = req.body;
        if (!isValidChore(choreData)) return res.status(400).json({message: "Invalid chore data"});
        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});


        let oldChoreObject = familyUnit.existingChores.find(chore => chore._id.toString() === req.params.choreid);

        const rruleConfig = {
            freq: RRule[req.body.freq],
            interval: 1,
            byweekday: req.body.weekdays.map(day => RRule[day]),
            dtstart: new Date(oldChoreObject.startDate),
            until: new Date(Date.UTC(2100, 12, 31))
        };
        if (rruleConfig.freq === RRule.MONTHLY){
            rruleConfig.bysetpos = choreData.monthlyChoreInterval || 1;
        }
        const newChore = new Chore({
            _id: oldChoreObject._id,
            name: req.body.name,
            priority: req.body.priority,
            kkReward: req.body.kkReward || oldChoreObject.kkReward,
            notes: req.body.notes || oldChoreObject.notes,
            repetitionRule: new RRule(rruleConfig),
            startDate: oldChoreObject.startDate,
            endDate: 4105161000000,
            paused: req.body.paused || oldChoreObject.paused
        });
        oldChoreObject.name = req.body.name || oldChoreObject.name;
        oldChoreObject.priority = req.body.priority || oldChoreObject.priority;
        oldChoreObject.kkReward = req.body.kkReward || oldChoreObject.kkReward;
        oldChoreObject.notes = req.body.notes || oldChoreObject.notes;
        oldChoreObject.paused = req.body.paused || oldChoreObject.paused;
        oldChoreObject.startDate = oldChoreObject.startDate;
        oldChoreObject.repetitionRule = new RRule(rruleConfig);

        //need to add the chores to the kids too
        if (choreData.choreAppliedTo ) {
            familyUnit.kidsList.forEach(kid => {
                const oldLEngth = kid.assignedChores.length;
                kid.assignedChores = kid.assignedChores.filter(choreId => choreId.toString() !== req.params.choreid);
                if (choreData.choreAppliedTo.includes(kid._id.toString()) ){
                    kid.assignedChores.push(newChore._id);
                } //deleting and re-adding is simpler than conditionally adding
                const newLength = kid.assignedChores.length;
                console.log('processed put chore', oldLEngth, newLength);
            })
        }

        const saveResult = await familyUnit.save();
        // console.log(saveResult);
        res.json(saveResult);
    });

    /**
     * create reward
     * name
     * kkCost
     * rewardAppliesTo
     */
    app.post('/familyunit/:unitid/reward', async (req, res) => {
        const rewardData = req.body;
        if (!isValidReward(rewardData)) return res.status(400).json({message: "Invalid reward data"});

        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        const newReward = new Reward({
            _id: new ObjectId(),
            ...rewardData
        });
        familyUnit.existingRewards.push(newReward);

        if (rewardData.rewardAppliesTo && rewardData.rewardAppliesTo.length > 0) {
            familyUnit.kidsList.forEach(kid => {
                if (rewardData.rewardAppliesTo.includes(kid._id.toString()) ){
                    kid.eligibleRewards.push(newReward._id);
                }
            })
        }

        const saveResult = await familyUnit.save();
        res.json(saveResult);
    });

    /**
     * update reward
     * name
     * kkCost
     * rewardAppliesTo
     */
    app.put('/familyunit/:unitid/reward/:rewardid', async (req, res) => {
        const rewardData = req.body;
        if (!isValidReward(rewardData)) return res.status(400).json({message: "Invalid reward data"});

        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        let rewardBeingEdited;

        familyUnit.existingRewards = familyUnit.existingRewards.map(curReward => {
            if (curReward._id.toString() !== req.params.rewardid) return curReward;
            rewardBeingEdited = curReward;
            return Object.assign(curReward, rewardData);
        });

        if (rewardData.rewardAppliesTo) {
            familyUnit.kidsList.forEach(kid => {
                kid.eligibleRewards = kid.eligibleRewards.filter(rewardId => rewardId.toString() !== req.params.rewardid);
                if (rewardData.rewardAppliesTo.includes(kid._id.toString()) ){
                    kid.eligibleRewards.push(rewardBeingEdited._id);
                }
            })
        }

        const saveResult = await familyUnit.save();
        res.json(saveResult);
    });

    /**
     * add child to family unit:
     * name
     * dob
     * gender
        kiddieKash: {type: Number},
        assignedChores: [],
        eligibleRewards: [],
        rewardsRedemptions: [],
        doneChores: [],
        delinquentChoreInstances: []
     *
     */
    app.post('/familyunit/:unitid/addchild', async (req, res) => {
        const childData = req.body;
        if (!isValidChild(childData)) return res.status(400).json({message: "Invalid child data"});

        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        const user = await User.findOne({auth0ID: req.user.sub});
        if (familyUnit.adminsList.indexOf(user.email) === -1) return res.status(403).json({message: 'Current user does not have access rights to family unit '+req.params.unitid});

        const newKid = {
            ...childData,
            assignedChores: [],
            eligibleRewards: [],
            rewardsRedemptions: [],
            doneChores: [],
            delinquentChoreInstances: [],
            allowanceAmount: Math.round((new Date().getTime() - getDOB(childData.dob))/oneYear),
            kreditInformation:{
                savingsRequired: 10,
                kiddieKashBalance: 0,
                utilization: { numerator: 0, denominator: 30 },
                choreHistory: { numerator: 0, denominator: 35 },
                avgChoreAge: { numerator: 0, denominator: 15 },
                totalChores: { numerator: 0, denominator: 10 },
                inquiries: { numerator: 0, denominator: 10 },
                punishments: {},
            }

        };

        if (!familyUnit.kidsList) familyUnit.kidsList = [];
        familyUnit.kidsList.push(newKid);

        const saveResult = await familyUnit.save();
        console.log('####saveresult', saveResult);
        res.json({
            ...saveResult,
            newKid: saveResult.kidsList[saveResult.kidsList.length-1]
        });
    });

    /**
     * DELETE CHILD BY ID
     */
    app.delete('/familyunit/:unitid/child/:childid', async (req, res) => {
        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        const user = await User.findOne({auth0ID: req.user.sub});
        if (familyUnit.adminsList.indexOf(user.email) === -1) return res.status(403).json({message: 'Current user does not have access rights to family unit '+req.params.unitid});

        const removedKidIndex = familyUnit.kidsList.findIndex(kid => kid._id.toString() === req.params.childid);
        if (removedKidIndex === -1) return res.status(404).json({message: `Child id ${req.params.childid} not found`})
        familyUnit.kidsList.splice(removedKidIndex, 1);

        const deleteResult = await familyUnit.save();
        console.log('####saveresult', deleteResult);
        res.json(deleteResult);
    });

    /**
     * Patch child settings
     */
    app.patch('/familyunit/:unitid/child/:childid', async (req, res) => {
        const childData = req.body;
        // if (typeof childData.allowanceAmount !== 'number' && typeof childData.savingsRequired !== 'number' )
        //     return res.status(400).json({message: "Invalid child data"});

        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        let kidIndex = familyUnit.kidsList.findIndex(kid => kid._id.toString() === req.params.childid);
        if (kidIndex === -1) return res.status(404).json({message: "kid not found in family unit"});

        familyUnit.kidsList[kidIndex] = Object.assign(familyUnit.kidsList[kidIndex], req.body);
        let saveResult;
        try {
            saveResult = await familyUnit.save();
        }
        catch(e){
            console.log(e);
            return res.status(400).json({message: "Invalid child data. " + JSON.stringify(e)});
        }

        res.json(saveResult);
    });

    /**
     * Request Complete chore
     */
    app.patch('/familyunit/:unitid/child/:childid/requestcompletechore', async (req, res) => {
        const {choreId} = req.body;
        if (typeof choreId === 'undefined')
            return res.status(400).json({message: "Invalid chore data"});


        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        const theChore = familyUnit.existingChores.find(chore => chore._id.toString() === choreId);
        if (!theChore) return res.status(400).json({message: "incorrect chore id"});

        let kidIndex = familyUnit.kidsList.findIndex(kid => kid._id.toString() === req.params.childid);
        if (kidIndex === -1) return res.status(404).json({message: "kid not found in family unit"});

        const doneChoreId = new mongoose.Types.ObjectId();
        familyUnit.kidsList[kidIndex].doneChores.push( {
            _id: doneChoreId,
            chore: choreId,
            status: "unapproved",
            timeStamp: new Date().getTime()
        });

        const saveResult1 = await familyUnit.save();


        //create alert for parent and send push notification
        //alert should have isTappable:true and recipient: parent


        const alertObj = {
            familyUnit: familyUnit._id,
            kid: req.params.childid,
            chore: choreId,
            timeStamp: new Date().getTime(),
            isTappable: true,
            status: 'new',
            notificationBody: `${familyUnit.kidsList[kidIndex].name} has requested approval for chore completion: ${theChore.name}`,
            recipient: 'parent',
            doneChoreId
        };
        createAlertWithPush(alertObj, familyUnit, User, Alert);

        res.json(saveResult1);
    });

    /**
     * Process chore approval request
     */
    app.patch('/familyunit/:unitid/child/:childid/processapprovalrequest', async (req, res) => {
        const {doneChoreId, status, alertId} = req.body;
        if (typeof doneChoreId === 'undefined' || typeof status !== 'string')
            return res.status(400).json({message: "Invalid chore or status data"});

        if (status !== "approved" && status !== "denied")
            return res.status(400).json({message: `Invalid chore status specified: ${status}`});

        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        let kidIndex = familyUnit.kidsList.findIndex(kid => kid._id.toString() === req.params.childid);
        if (kidIndex === -1) return res.status(404).json({message: "kid not found in family unit"});
        const theKid = familyUnit.kidsList[kidIndex];

        const doneChoreEntry = theKid.doneChores.find(c => c._id.toString() === doneChoreId);
        const doneChoreIndex = theKid.doneChores.findIndex(c => c._id.toString() === doneChoreId);
        if (!doneChoreEntry) return res.status(404).json({message: "doneChoreId illegal"});

        const theChore = familyUnit.existingChores.find(chore => chore._id.toString() === doneChoreEntry.chore.toString());
        if (!theChore) return res.status(400).json({message: "incorrect chore id"});


        let saveResult1 = familyUnit;
        if (doneChoreEntry.status !== 'approved'){
            doneChoreEntry.status = status;

            // familyUnit.kidsList[kidIndex] = Object.assign(theKid, kidUpdate);
            saveResult1 = await familyUnit.save();


            let notificationBody = `Congratulations! Your submission for '${theChore.name}' has been approved!`
            if (status !== "approved"){
                notificationBody = `Your submission for '${theChore.name}' has been denied. Check with your parent to find why.`;
            }

            const alertObj = {
                familyUnit: familyUnit._id,
                kid: theKid._id,
                chore: theChore._id,
                timeStamp: new Date().getTime(),
                isTappable: false,
                status: 'new',
                notificationBody,
                recipient: 'child-'+theKid._id.toString(),
            };
            createAlertWithPush(alertObj, familyUnit, User, Alert);
        }

        const theAlert = await Alert.findOne({_id: alertId});
        theAlert.status = "processed";
        theAlert.isTappable = 'false';
        const savedAlert = await theAlert.save();

        res.json({
            familyUnit: saveResult1,
            alert: savedAlert
        });
    });

    /**
     * add admin to family unit:
     * @param email
     *
     */
    app.post('/familyunit/:unitid/addadmin', async (req, res) => {
        const adminEmail = req.body.email;
        if (!adminEmail) return res.status(400).json({message: "Admin email cannot be empty"});
        if (!adminEmail.match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/))
            return res.status(400).json({message: "Invalid admin email"});

        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        const user = await User.findOne({auth0ID: req.user.sub});
        if (familyUnit.adminsList.indexOf(user.email) === -1) return res.status(403).json({message: 'Current user does not have access rights to family unit '+req.params.unitid});

        if (!familyUnit.adminsList) familyUnit.adminsList = [];
        familyUnit.adminsList.push(adminEmail);

        const saveResult = await familyUnit.save();
        console.log('####addAdmin saveresult', saveResult);

        let familyAdminPromises = [];
        if (saveResult.adminsList.length > 0)
            familyAdminPromises = saveResult.adminsList.map(parentEmail => User.findOne({email: parentEmail}));

        let familyAdmins = await Promise.all(familyAdminPromises);
        familyAdmins = familyAdmins.map((admin, idx) => admin || saveResult.adminsList[idx])

        const familyUnitObj = saveResult.toObject();

        res.json({
            familyUnit: {
                ...familyUnitObj,
                adminsList: familyAdmins
            }
        });
    });

    /**
     * mark reward as redeemed (create rewards redemption, lower KK balance)
     * @param rewardId
     * @param kidId
     *
     */
    app.post('/familyunit/:unitid/rewardredemption', async (req, res) => {
        const {kidId, rewardId} = req.body;
        if (!kidId || !rewardId) return res.status(400).json({message: "This endpoint for reward completion requires kidID and rewardId"});
        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        const user = await User.findOne({auth0ID: req.user.sub});
        if (familyUnit.adminsList.indexOf(user.email) === -1) return res.status(403).json({message: 'Current user does not have access rights to family unit '+req.params.unitid});

        const rewardToComplete = familyUnit.existingRewards.find(rewardObj => rewardObj._id.toString() === rewardId);
        if (!rewardToComplete) return res.status(404).json({message: `Reward id ${rewardId} could not be found` });

        const theKid = familyUnit.kidsList.find(kid => kid._id.toString() === kidId);
        if (!theKid) return res.status(404).json({message: `Kid id ${kidId} could not be found` });
        if (!theKid.kreditInformation || !theKid.kreditInformation.kiddieKashBalance || theKid.kreditInformation.kiddieKashBalance < rewardToComplete.kkCost)
            return res.status(404).json({message: `${theKid.name} does not have a high enough balance to redeem this reward.` });

        theKid.rewardsRedemptions.push({
            _id: new ObjectId(),
            timeStamp: new Date().getTime(),
            reward: rewardToComplete._id.toString()
        });

        theKid.kreditInformation.kiddieKashBalance -= rewardToComplete.kkCost;

        const saveResult = await familyUnit.save();
        console.log('####reward redemption result', saveResult);
        res.json(saveResult);
    });
};



function isValidReward(rewardData){
    const {name, kkCost} = rewardData;
    return typeof name !== 'undefined' &&
        typeof kkCost !== 'undefined';
}

function isValidChild(child){
    const {name, dob, gender} = child;
    return !!name && !!dob && !!gender;
}

const oneYear = 1000 * 60 * 60 * 24 * 365;
function getDOB(dobStr) {
    const [month, day, year] = dobStr.split("-");
    const d = new Date(dobStr);
    d.setDate(day);
    return d.getTime();
}
