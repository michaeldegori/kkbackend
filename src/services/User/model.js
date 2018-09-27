const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    // familyUnit: {type: Schema.Types.ObjectId, ref: 'FamilyUnit'},
    auth0ID: {type: String, index: true, unique: true},
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String, index: true, unique: true},
    avatar: {type: String},
    userType: {type: String, enum: ['parent', 'admin']},
    userSubType: {type: String, enum: ['mother', 'father', 'male_guardian', 'female_guardian']},
    parentInfo: {type: Schema.Types.Mixed}, //anything that might be specific to parent, like maybe app settings
});

module.exports = function(db){
    return db.model('User', UserSchema);
};