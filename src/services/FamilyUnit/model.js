const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ChoreSchema} = require('../DefaultChore/model');
const {RewardSchema} = require('../DefaultReward/model');

const oneYear = 1000 * 60 * 60 * 24 * 365;
const getDOB = dobStr => {
    const [month, day, year] = dobStr.split("-");
    const d = new Date(dobStr);
    d.setDate(day);
    return d;
}

const KidInfoSchema = new Schema({
    name: {type: String},
    dob: {type: String},
    gender: {type: String, enum: ['male', 'female']},
    kiddieKash: {type: Number},
    assignedChores: [{type: Schema.Types.ObjectId}],
    eligibleRewards: [{type: Schema.Types.ObjectId}],
    rewardsRedemptions: [Schema.Types.Mixed],
    doneChores: [Schema.Types.ObjectId],
    delinquentChoreInstances: [Schema.Types.Mixed],
    allowanceAmount: {
        type: Number,
        default: function(){
            return Math.round((new Date().getTime() - getDOB(this.dob))/oneYear)
        }
    },
    savingsRequired: {
        type: Number,
        default: function(){
            return Math.round((new Date().getTime() - getDOB(this.dob))/oneYear)
        }
    }
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