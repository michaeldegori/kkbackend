const {RRule, rrulestr} = require('rrule');

const oneDay = 1000 * 60 * 60 * 24;
test('Correctly computes the number of chore occurrences since last time it was processed', ()=>{
    const lastProcessedTime = new Date().getTime() - 7*oneDay;
    const currentHour = new Date().getUTCHours()+1;
    for (let ctr = 0; ctr < 25; ctr++){
        const startTime = Math.floor(Math.random()*10000*currentHour);
        const startTimeStr = ('000000'+startTime).slice(-6);
        const choreRRule = rrulestr(`DTSTART:20181018T${startTimeStr}Z\nRRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU;UNTIL=21010131T000000Z`);
        const occurrencesSinceLastProcessed = choreRRule.between(new Date(lastProcessedTime), new Date());

        expect(occurrencesSinceLastProcessed.length).toBe(7);
    }
});