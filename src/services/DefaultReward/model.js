const mongoose = require('mongoose');
const {Schema} = mongoose;

const RewardSchema = new Schema({
    name: {type: String},
    kkCost: {type: Number},
    notes: ""
});

module.exports = {
    modelFactory: db => db.model('BuiltInReward', RewardSchema),
    RewardSchema
};