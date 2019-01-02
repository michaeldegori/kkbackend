
const mongoose = require('mongoose');
const {Schema} = mongoose;

const ChoreSchema = new Schema({
    name: {type: String, required: true},
    priority: {type: String, required: true},
    kkReward: {type: String, required: true},
    notes: {type: String},
    repetitionRule: {type: String, required: true},
    startDate: {type: Number, required: true},
    endDate: {type: Number},
    paused: {type: Boolean, default: false},
    description: String
});

const ChoreSuggestionSchema = new Schema({
   name: {type: String, required: true},
   ageGroup: {type: String, required: true},
});



module.exports = {
    modelFactory: db => db.model('BuiltInChore', ChoreSchema),
    suggestionModelFactory: db => db.model('ChoreSuggestion', ChoreSuggestionSchema),
    ChoreSchema
};
