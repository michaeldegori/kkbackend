const mongoose = require('mongoose');
const {Schema} = mongoose;
const ChoreSchema = require('./ChoreSchema');
const RewardSchema = require('./RewardSchema');

const KidInfoSchema = new Schema({
    name: {type: String},
    dob: {type: String},
    gender: {type: String, enum: ['male', 'female']},
    kiddieKash: {type: Number},
    assignedChores: [{type: Schema.Types.ObjectId}],
    eligibleRewards: [{type: Schema.Types.ObjectId}],
    rewardsRedemptions: [Schema.Types.Mixed],
    doneChores: [Schema.Types.ObjectId],
    delinquentChoreInstances: [Schema.Types.Mixed]
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