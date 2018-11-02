const {RRule} = require('rrule');
const mongoose = require('mongoose');

const defaultChoreInfo = [
    ['Put toys away', '4-5'],
    ['Put clothes in hamper', '4-5'],
    ['Dust', '4-5'],
    ['Empty trash', '4-5'],
    ['Bring in mail', '4-5'],
    ['Clear table', '4-5'],
    ['Pull weeds', '4-5'],
    ['Water flowers', '4-5'],
    ['Sort laundry', '6-7'],
    ['Sweep floors', '6-7'],
    ['Set table', '6-7'],
    ['Pack lunch', '6-7'],
    ['Rake leaves', '6-7'],
    ['Clean room', '6-7'],
    ['Load dishwasher', '8-9'],
    ['Put away groceries', '8-9'],
    ['Vacuum', '8-9'],
    ['Help make dinner', '8-9'],
    ['Make own snacks', '8-9'],
    ['Wash table after meal', '8-9'],
    ['Put away own laundry', '8-9'],
    ['Make breakfast', '8-9'],
    ['Mop floor', '8-9'],
    ['Unload dishwasher', '10-12'],
    ['Fold laundry', '10-12'],
    ['Clean bathroom', '10-12'],
    ['Wash windows', '10-12'],
    ['Wash car', '10-12'],
    ['Cook simple meal', '10-12'],
    ['Iron clothes', '10-12'],
    ['Do laundry', '10-12'],
    ['Babysit', '10-12'],
    ['Clean kitchen', '10-12'],
    ['Change bed sheets', '10-12'],
];

exports.routeFactory = async function(app, User, ChoreSuggestion){
    app.get('/defaultchores', async (req, res) => {
        const chores = await ChoreSuggestion.find();
        res.json(chores);
    });


    let c = await ChoreSuggestion.findOne({_id: '5bb6f007c4e3fb21080f6300'});
    if (c) return;

    let idRoot='5bb6f007c4e3fb21080f63';
    console.log('Populating default chores...');
    const defaultChoresToSave = defaultChoreInfo.map((cArr, idx) => new ChoreSuggestion({
        _id: new mongoose.Types.ObjectId(`idRoot${("0"+idx).slice(-2)}`),
        name: cArr[0],
        ageGroup: cArr[1]
    }));
    await Promise.all(defaultChoresToSave);
    console.log("Saved default chores");
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
