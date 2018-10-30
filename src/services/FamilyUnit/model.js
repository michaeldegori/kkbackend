const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ChoreSchema} = require('../DefaultChore/model');
const {RewardSchema} = require('../DefaultReward/model');



const KidInfoSchema = new Schema({
    name: {type: String},
    dob: {type: String},
    gender: {type: String, enum: ['male', 'female']},
    kiddieKash: {type: Number},
    assignedChores: [{type: Schema.Types.ObjectId}],
    eligibleRewards: [{type: Schema.Types.ObjectId}],
    rewardsRedemptions: [Schema.Types.Mixed],
    doneChores: [Schema.Types.Mixed],
    delinquentChoreInstances: [Schema.Types.Mixed],
    allowanceAmount: {type: Number},
    savingsRequired: {type: Number},
});

const FamilyUnitSchema = new Schema({
    adminsList: [{type: 'String'}],
    kidsList: [KidInfoSchema],
    existingChores: [ChoreSchema],
    choreExceptions: [Schema.Types.Mixed],
    existingRewards: [RewardSchema]
});

module.exports = function(db){
    return db.model('FamilyUnit', FamilyUnitSchema);
};