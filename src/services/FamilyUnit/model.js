const mongoose = require('mongoose');
const {Schema} = mongoose;
const ChoreSchema = require('./ChoreSchema');
const RewardSchema = require('./RewardSchema');

const FamilyUnitSchema = new Schema({
    adminsList: [{type: Schema.Types.ObjectId, ref: 'User'}],
    kidsList: [{type: Schema.Types.ObjectId, ref: 'User'}],
    existingChores: [ChoreSchema],
    choreExceptions: [Schema.Types.Mixed],
    rewardsList: [RewardSchema]
});

module.exports = function(db){
    return db.model('FamilyUnit', FamilyUnitSchema);
};