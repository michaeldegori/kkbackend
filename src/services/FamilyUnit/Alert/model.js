const mongoose = require('mongoose');
const {Schema} = mongoose;


const AlertSchema = new Schema({
    familyUnit: {type: Schema.Types.ObjectId, index: true},
    kid: {type: Schema.Types.ObjectId},
    chore: {type: Schema.Types.ObjectId},
    timeStamp: Number,
    isTappable: Boolean,
    status: {type: String, enum:["new", "processed"]},
    notificationBody: String,
    recipient: String, //matches up to browsing_mode
    doneChoreId: Schema.Types.ObjectId,
    invisibleTo: []
});


module.exports = {
    modelFactory: db => db.model('Alert', AlertSchema),
    AlertSchema,
};