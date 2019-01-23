const mongoose = require('mongoose');
const {Schema} = mongoose;

//EI = educational information
const ParentDashboardEISchema = new Schema({
    utilization: String,
    paymentHistory: String,
    accountAge: String,
    numAccounts: String,
    creditInquiries: String,
    derogatoryMarks: String,
});

const KidDashboardEISchema = new Schema({
    utilization: String,
    paymentHistory: String,
    accountAge: String,
    numAccounts: String,
    creditInquiries: String,
    derogatoryMarks: String,
});



module.exports = {
    parentInfoModelFactory: db => db.model('ParentDashboardEI', ParentDashboardEISchema, 'ParentDashboardEI'),
    kidInfoModelFactory: db => db.model('KidDashboardEI', KidDashboardEISchema, 'KidDashboardEI'),
    ParentDashboardEISchema,
    KidDashboardEISchema
};
