module.exports = function(app, User, FamilyUnit){
    /**
     * Get family unit pertaining to user id of main logged in user,
     * including chores and rewards available
     */
    app.get('/familyunit/', async (req, res) => {
        if (!req.user || !req.user.sub) res.status(400).json({Err: 'no token'});
        let currentUser = await User.findOne({auth0: req.user.sub});
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

        res.json({
            familyUnit: {
                ...familyUnit,
                adminsList: familyAdmins
            },
            currentUser
        });
    });

    /**
     * create chore
     *   name: {type: String},
         priority: {type: String},
         kkReward: {type: String},
         duration: {type: String},
         notes: {type: String},
         repetitionRule: {type: String},
         startDate: {type: Number},
         endDate: {type: Number},
         paused: {type: Boolean}
     */
    app.post('/familyunit/:unitid/createchore', async (req, res) => {
        const choreData = req.body;
        if (!isValidChore(choreData)) return res.status(400).json({message: "Invalid chore data"});
        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        familyUnit.existingChores.push(choreData);
        const saveResult = await familyUnit.save();
        res.json(saveResult);
    });

    /**
     * create reward
     * name
     * duration
     * kkCost
     */
    app.post('/familyunit/:unitid/createreward', async (req, res) => {
        const rewardData = req.body;
        if (!isValidReward(rewardData)) return res.status(400).json({message: "Invalid reward data"});

        const familyUnit = await FamilyUnit.findOne({_id: req.params.unitid});
        if (!familyUnit) return res.status(404).json({message: "familyUnit not found"});

        familyUnit.existingRewards.push(rewardData);
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

        familyUnit.kidsList.push({
            ...childData,
            kiddieKash: 0,
            assignedChores: [],
            eligibleRewards: [],
            rewardsRedemptions: [],
            doneChores: [],
            delinquentChoreInstances: []
        });
        const saveResult = await familyUnit.save();
        res.json(saveResult);
    });
};

function isValidChore(choreData){
    const {name, priority, kkReward,
        duration, notes, repetitionRule,
        startDate, endDate} = choreData;
    return name && typeof priority !== 'undefined' &&
        typeof duration !== 'undefined' &&
        typeof notes !== 'undefined' &&
        typeof kkReward !== 'undefined' &&
        typeof repetitionRule !== 'undefined' &&
        typeof startDate !== 'undefined' &&
        typeof endDate !== 'undefined';
}

function isValidReward(rewardData){
    const {name, duration, kkCost} = rewardData;
    return typeof name !== 'undefined' &&
        typeof duration !== 'undefined' &&
        typeof kkCost !== 'undefined';
}

function isValidChild(child){
    const {name, dob, gender} = child;
    return !!name && !!dob && !!gender;
}
