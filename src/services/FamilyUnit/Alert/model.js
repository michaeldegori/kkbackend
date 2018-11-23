const mongoose = require('mongoose');
const {Schema} = mongoose;
const sendPushNotification = require('../../SendPushNotification.js');


const AlertSchema = new Schema({
    familyUnit: {type: Schema.Types.ObjectId, index: true},
    kid: {type: Schema.Types.ObjectId},
    chore: {type: Schema.Types.ObjectId},
    timeStamp: Number,
    isTappable: Boolean,
    status: {type: String, enum:["new", "processed"]},
    notificationBody: String,
    recipient: String,
    pushNotification: {type: Boolean, default: true}
});


module.exports = {
    modelFactory: db => db.model('Alert', AlertSchema),
    AlertSchema,
    preSaveHook: FamilyUnit => function(next){
        if (!this.pushNotification){
            next();
            return;
        }
        FamilyUnit.findOne({_id: this.familyUnit})
            .then(fam => {
                let tokens = [];
                if (this.recipient && this.recipient === "child"){

                }
                sendPushNotification([], this.notificationBody)

            });
        next();
    }
};