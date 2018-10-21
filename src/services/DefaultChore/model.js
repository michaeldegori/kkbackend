
const mongoose = require('mongoose');
const {Schema} = mongoose;

const ChoreSchema = new Schema({
    name: {type: String},
    priority: {type: String},
    kkReward: {type: String},
    notes: {type: String},
    repetitionRule: {type: String},
    startDate: {type: Number},
    endDate: {type: Number},
    paused: {type: Boolean, default: false}
});



module.exports = {
    modelFactory: db => db.model('BuiltInChore', ChoreSchema),
    ChoreSchema
};
