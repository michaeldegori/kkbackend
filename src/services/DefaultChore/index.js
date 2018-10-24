const {RRule} = require('rrule');
const mongoose = require('mongoose');

exports.routeFactory = async function(app, User, Chore){
    app.get('/defaultchores', async (req, res) => {
        const chores = await Chore.find();
        res.json(chores);
    });


    let c = await Chore.findOne({_id: '5bb6f007c4e3fb21080f63b9'});
    if (c) return;

    c = new Chore({
        _id: new mongoose.Types.ObjectId('5bb6f007c4e3fb21080f63b9'),
        name: "Go to sleep well",
        priority: 4,
        kkReward: 50,
        notes: "Leverage agile frameworks to provide a robust synopsis for high level overviews.",
        repetitionRule: new RRule({
            freq: RRule.WEEKLY,
            interval: 1,
            byweekday: [RRule.MO, RRule.WE , RRule.FR],
            dtstart: new Date(),
            until: new Date(Date.UTC(2100, 12, 31))
        }),
        startDate: new Date().getTime(),
        endDate: 4105161000000,
        paused: false
    });
    c.save().then(console.log);
};


exports.isValidChore = function(choreData){
    const {name, priority, kkReward,
        notes, freq, weekdays} = choreData;
    return name && typeof priority !== 'undefined' &&
        typeof notes !== 'undefined' &&
        typeof kkReward !== 'undefined' &&
        typeof freq !== 'undefined' &&
        typeof weekdays !== 'undefined';
};

module.exports = exports;