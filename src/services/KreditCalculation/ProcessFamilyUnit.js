const {RRule, rrulestr} = require('rrule');
const {getKreditInformationForKid} = require('./KreditKalculation.js');

// const testRule1 = rrulestr('DTSTART:20181027T010047Z\nRRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=FR;UNTIL=21010131T000000Z');
// const oneDay = 1000 * 60 * 60 * 24;
// const occurrences = testRule1.between(new Date(new Date().getTime() - oneDay*21), new Date());
// console.log(RRule.optionsToString({freq: testRule1.options.freq}));
// console.log(occurrences);

/**
 *
 * @param familyUnit
 * @returns {*} mutated version of familyUnit, ready to save
 */
function processFamilyUnit(fu) {
    const oneDay = 1000 * 60 * 60 * 24;
    const familyUnit = JSON.parse(JSON.stringify(fu));
    const lastProcessedTime = familyUnit.lastProcessedTime || (new Date().getTime() - oneDay);

    familyUnit.kidsList.forEach(kid => {
        //if it's Friday, add the kiddieKash
        if (new Date().getDay() === 6){
            if (!kid.kreditInformation) kid.kreditInformation = {};
            kid.kreditInformation.kiddieKashBalance = (kid.kreditInformation.kiddieKashBalance || 0) + kid.allowanceAmount;
        }

        const kidChores = kid.assignedChores.map(choreId => familyUnit.existingChores.find(fc => fc._id.toString() === choreId));
        kidChores.forEach(kidChore => {
            const choreRRule = rrulestr(kidChore.repetitionRule);
            const occurrencesSinceLastProcessed = choreRRule.between(new Date(lastProcessedTime), new Date());
            if (occurrencesSinceLastProcessed.length === 0) {
                //no occurrences for this chore
                console.log(`Child ${kid.name} in familyUnit ${familyUnit._id} had no occurrences of any chores due today`);
                return {};
            }
            const lastChoreOccurrence = occurrencesSinceLastProcessed[occurrencesSinceLastProcessed.length - 1];
            //check if this chore is in kid's doneChores since last date of occurrence
            const aMonthAgo = new Date(new Date().getTime() - oneDay*33);
            const lastMonthOccurrences = choreRRule.between(aMonthAgo, new Date());
            const lastChoreOccurrenceBeforeToday = lastMonthOccurrences[lastMonthOccurrences.length-2] || new Date(aMonthAgo).toISOString(); //in case this is the first time the chore came due
            const lastChoreOccurrenceTimeStamp = new Date(lastChoreOccurrenceBeforeToday).getTime();
            const doneChore = kid.doneChores.find(doneChore =>
                doneChore.chore.toString() === kidChore._id.toString() &&
                doneChore.timeStamp >= lastChoreOccurrenceTimeStamp &&
                doneChore.status !== 'denied'
            );
            if (!doneChore){ //not at all done or denied
                kid.delinquentChoreInstances.push({
                    timeStamp: new Date().getTime(),
                    chore: kidChore._id
                });
                return;
            }
            if (doneChore.status === 'unapproved'){
                doneChore.status = 'approved';
                //send push to parent letting them know their kids chore was auto approved
            }
        });
        //recompute kredit info for family unit
        kid.kreditInformation = {
            ...kid.kreditInformation,
            ...getKreditInformationForKid(familyUnit, kid)
        }; //merge so we can keep settings and what not
    });
    return {
        lastProcessedTime: new Date().getTime(),
        kidsList: familyUnit.kidsList
    };
}

module.exports = {
    processFamilyUnit
};