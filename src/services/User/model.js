const mongoose = require('mongoose');
const {Schema} = mongoose;

const KidInfoSchema = new Schema({
    kiddieKash: {type: Number},
    assignedChores: {type: Schema.Types.ObjectId},
    elegibleRewards: {type: Schema.Types.ObjectId},
    rewardsRedemptions: [Schema.Types.Mixed],
    doneChores: [Schema.Types.ObjectId],
    delinQuentChoreInstances: [Schema.Types.Mixed]
});

module.exports = function(db){
    const UserSchema = new Schema({
        // familyUnit: {type: Schema.Types.ObjectId, ref: 'FamilyUnit'},
        firstName: {type: String},
        lastName: {type: String},
        email: {type: String},
        avatar: {type: String},
        UserType: {type: String, enum: ['parent', 'child']},
        UserSubType: {type: String, enum: ['mother', 'father', 'male_guardian', 'female_guardian']},
        parentInfo: {type: Schema.Types.Mixed}, //anything that might be specific to parent, like maybe app settings
        kidInfo: {type: KidInfoSchema}
    });



    return db.model('User', UserSchema);
};