const {isValidChore}  = require("../DefaultChore");
const {RRule} = require('rrule');
const {Types: {ObjectId}} = require('mongoose');

module.exports = function(app, User, FamilyUnit, Chore, Reward){
    /**
     * Get family unit pertaining to user id of main logged in user,
     * including chores and rewards available
     */
    app.get('/familyunit', async (req, res) => {
        if (!req.user || !req.user.sub) res.status(400).json({Err: 'no token'});
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

            const familyAdmins = await Promise.all(familyAdminPromises);
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
            paused: false
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


        familyUnit.existingRewards = familyUnit.existingRewards.map(curReward => {
            if (curReward._id.toString() !== req.params.rewardid) return curReward;
            return Object.assign(curReward, rewardData);
        });

        if (rewardData.rewardAppliesTo) {
            familyUnit.kidsList.forEach(kid => {
                familyUnit.kidsList.eligibleRewards = familyUnit.kidsList.eligibleRewards.filter(rewardId => rewardId.toString() !== req.params.rewardid);
                if (rewardData.rewardAppliesTo.includes(kid._id.toString()) ){
                    kid.eligibleRewards.push(newReward._id);
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

        const newKid = {
            ...childData,
            kiddieKash: 0,
            assignedChores: [],
            eligibleRewards: [],
            rewardsRedemptions: [],
            doneChores: [],
            delinquentChoreInstances: []
        };
        familyUnit.kidsList.push(newKid);

        const saveResult = await familyUnit.save();
        console.log('####saveresult', saveResult);
        res.json({
            ...saveResult,
            newKid: saveResult.kidsList[saveResult.kidsList.length-1]
        });
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
