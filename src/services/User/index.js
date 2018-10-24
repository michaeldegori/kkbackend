module.exports = function(app, User, FamilyUnit){
    /**
     * Requires following inputs in body:
     * firstName
     * lastName
     * email*
     * userSubType* enum ['mother', 'father', 'male_guardian', 'female_guardian']
     */
    app.post('/user/finishRegistration', async (req, res) => {
        if (!req.user || !req.user.sub) res.status(400).json({Err: 'no token'});
        // try to retrieve user from email address in token
        let queryData = req.query;
        let currentUser = await User.findOne({auth0ID: req.user.sub});
        console.log('USER DECODED FROM JWT:',req.user, 'USER FROM DB:', currentUser);
        try {

            // if user doesn't exist, create it
            if (!currentUser) {
                currentUser = new User({
                    auth0ID: req.user.sub,
                    firstName: queryData.firstName || '',
                    lastName: queryData.lastName || '',
                    email: queryData.email,
                    avatar: req.user.picture,
                    userType: 'parent',
                    userSubType: queryData.userSubType || 'mother'
                });
                await currentUser.save();
            }
            // retrieve familyunit for this user
            let familyUnit = await FamilyUnit.findOne({adminsList: queryData.email});
            // if familyunit doesnt exist, create it
            if (!familyUnit) {
                familyUnit = new FamilyUnit({
                    adminsList: [currentUser.email],
                    kidsList: [],
                    existingChores: [],
                    choreExceptions: [],
                    rewardsList: []
                });
                await familyUnit.save();
            }

            // NOTE: if familyunit exists, we might want to
            // merge creation with existing familyunit

            //send response back with familyunit and userdata
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
                    ...familyUnit.toObject(),
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
     * GET user data by auth0ID
     */
    app.get('/user/:auth0ID', async (req, res) => {
        if (!req.user || !req.user.sub || req.user.sub !== req.params.auth0ID)
            res.status(400).json({Err: 'no token'});

        const currentUser = await User.findOne({auth0ID: req.params.auth0ID});
        if (!currentUser) return res.status(404).json({err: 'User not found'});

        let familyUnit = await FamilyUnit.findOne({adminsList: currentUser.email});
        if (!familyUnit) return res.status(404).json({err: 'Family Unit not found for user '+req.params.auth0ID});


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
     * Update any field in user model
     */
    app.patch('/user/:id', (req, res) => {

    });
};