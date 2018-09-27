const mongoose = require('mongoose');
const {Schema} = mongoose;

const RewardSchema = new Schema({
    name: {type: String},
    duration: {type: String},
    kkCost: {type: Number},
});

module.exports = RewardSchema;