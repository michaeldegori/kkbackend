const {
    getKreditInformationForFamilyUnit,
    computeUtilization,
    computeChoreHistory,
    computeAvgChoreAge,
    computeTotalChores,
    computeInquiries,
    computePunishments,
} = require('./KreditKalculation');

/*
test('adds 1 + 2 to equal 3', async () => {
  expect(sum(1, 2)).toBe(3);
});
expect(data).toEqual({one: 1, two: 2});
expect(a + b).not.toBe(0);
expect(n).toBeNull();
expect(n).toBeDefined();
expect(n).not.toBeUndefined();
expect(n).not.toBeTruthy();
expect(n).toBeFalsy();
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3.5);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(4.5);
expect('Christoph').toMatch(/stop/);
array:
expect(shoppingList).toContain('beer');
 */

const oneDay = 1000 * 60 * 60 * 24;
const mockFamilyUnit = {
    "_id": "5bd36b7c348176460b2c7fb3",
    "adminsList": ["marjvic@gmail.com"],
    "choreExceptions": [],
    "kidsList": [{
        "assignedChores": ["5bd3b8bf348176460b2c7fb9", "5bdcd459f3b62e14cc61f00b"], //0 and 1
        "eligibleRewards": ["5bd36bf9348176460b2c7fb6"],
        "rewardsRedemptions": [
            { id: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*5 }, //kkcost 1
            { id: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*4 },
            { id: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*3 },
            { id: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*2 },
            { id: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*2 },
            { id: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*2 },
            { id: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*3 },
            { id: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*1 }, //total 8
        ],
        "doneChores": [
            {"id": "5bdcd459f3b62e14cc61f00b", "status": 'approved', timeStamp: new Date().getTime() - oneDay * 14}, //reward 2
            {"id": "5bdcd459f3b62e14cc61f00b", "status": 'approved', timeStamp: new Date().getTime() - oneDay * 5},
            {"id": "5bdcd459f3b62e14cc61f00b", "status": 'approved', timeStamp: new Date().getTime() - oneDay * 4},
            {"id": "5bdcd459f3b62e14cc61f00b", "status": 'approved', timeStamp: new Date().getTime() - oneDay * 3},
            {"id": "5bd3b8bf348176460b2c7fb9", "status": 'unapproved', timeStamp: new Date().getTime() - oneDay * 1}, //reward 1  total = 21
        ],
        "delinquentChoreInstances": [
            {timeStamp: new Date().getTime()-oneDay*10, id: '5bd3b8bf348176460b2c7fb9'}, //3 priority
            {timeStamp: new Date().getTime()-oneDay*8, id: '5bd3b8bf348176460b2c7fb9'},
            {timeStamp: new Date().getTime()-oneDay*7, id: '5bdcd459f3b62e14cc61f00b'}, //2
            {timeStamp: new Date().getTime()-oneDay*6, id: '5bd3b8bf348176460b2c7fb9'},
            {timeStamp: new Date().getTime()-oneDay*5, id: '5bdcd459f3b62e14cc61f00b'},
            {timeStamp: new Date().getTime()-oneDay*2, id: '5bd3b8bf348176460b2c7fb9'},
            {timeStamp: new Date().getTime()-oneDay*1, id: '5bdcd459f3b62e14cc61f00b'}, //total missed points 18
        ],
        "_id": "5bd36ba3348176460b2c7fb4",
        "name": "Max",
        "dob": "03-25-2016",
        "gender": "male",
        "allowanceAmount": 11,
        "savingsRequired": 10,
        kreditInformation: {
            savingsRequired: 10,
            kiddieKashBalance: 9,
            rewardsRedemptions: { value: 0, denominator: 30 },
            choreHistory: { value: 0, denominator: 35 },
            avgChoreAge: { value: 0, denominator: 15 },
            totalChores: { value: 0, denominator: 10 },
            rewardsRequests: { value: 0, denominator: 10 },
            punishments: {},
        }
    }, {
        "assignedChores": ["5bd3b8bf348176460b2c7fb9", "5bdcd477f3b62e14cc61f00e"],
        "eligibleRewards": ["5bd36bf9348176460b2c7fb6"],
        "rewardsRedemptions": [],
        "doneChores": [{"id": "5bdcd477f3b62e14cc61f00e", "approved": false}],
        "delinquentChoreInstances": [],
        "_id": "5bd36bca348176460b2c7fb5",
        "name": "Emma",
        "dob": "02-11-2018",
        "gender": "female",
        "kiddieKash": 0,
        "allowanceAmount": 11,
        "savingsRequired": 5
    }],
    "existingChores": [{
        "paused": false,
        "_id": "5bd3b8bf348176460b2c7fb9",
        "name": "Watch Arnold Movies",
        "priority": "3",
        "kkReward": "1",
        "notes": "",
        "repetitionRule": "DTSTART:20181027T010047Z\nRRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=FR;UNTIL=21010131T000000Z",
        "startDate": 1540602047512,
        "endDate": 4105161000000
    }, {
        "paused": false,
        "_id": "5bdcd459f3b62e14cc61f00b",
        "name": "Bring in mail",
        "priority": "2",
        "kkReward": "2",
        "notes": "",
        "repetitionRule": "DTSTART:20181102T224857Z\nRRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU;UNTIL=21010131T000000Z",
        "startDate": 1541198937597,
        "endDate": 4105161000000
    }, {
        "paused": false,
        "_id": "5bdcd477f3b62e14cc61f00e",
        "name": "Clean room",
        "priority": "3",
        "kkReward": "1",
        "notes": "",
        "repetitionRule": "DTSTART:20181102T224927Z\nRRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TH;UNTIL=21010131T000000Z",
        "startDate": 1541198967719,
        "endDate": 4105161000000
    }],
    "existingRewards": [{
        "_id": "5bd36bf9348176460b2c7fb6",
        "name": "Watch TV forever",
        "kkCost": 1,
        "notes": "dsf adsf sdffd ssdsfd "
    }],
    "__v": 11
};

const mockUser = {
    "_id": "5bd36b7c348176460b2c7fb2",
    "auth0ID": "auth0|5bb6e10368a56c4c5130f58f",
    "firstName": "Victor",
    "lastName": "Moreno",
    "email": "marjvic@gmail.com",
    "avatar": "https://s.gravatar.com/avatar/ac88bcdbaaaa40b921d06a5136610fe3?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fma.png",
    "userType": "parent",
    "userSubType": "father",
    "__v": 0,
    "pushNotificationInformation": {
        "expo": [{"token": "ExponentPushToken[FyTxJsEpxm6B2F8q9aA2f5]"}, {
            "token": "ExponentPushToken[hXBk4VGSK9EKwhix6i_64y]",
            "browsingMode": "parent",
            "email": "marjvic@gmail.com"
        }]
    }
};


const mockMax = {
    "assignedChores": ["5bd3b8bf348176460b2c7fb9", "5bdcd459f3b62e14cc61f00b"], //0 and 1
    "eligibleRewards": ["5bd36bf9348176460b2c7fb6"],
    "rewardsRedemptions": [
        { id: 'bbd36bf9348176460b2c7fb6', reward: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*5 }, //kkcost 1
        { id: 'bbd36bf9348176460b2c7fb6', reward: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*4 },
        { id: 'bbd36bf9348176460b2c7fb6', reward: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*3 },
        { id: 'bbd36bf9348176460b2c7fb6', reward: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*2 },
        { id: 'bbd36bf9348176460b2c7fb6', reward: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*2 },
        { id: 'bbd36bf9348176460b2c7fb6', reward: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*2 },
        { id: 'bbd36bf9348176460b2c7fb6', reward: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*3 },
        { id: 'bbd36bf9348176460b2c7fb6', reward: '5bd36bf9348176460b2c7fb6', timeStamp: new Date().getTime() - oneDay*1 }, //total 8
    ],
    "doneChores": [
        {"id": "abdcd459f3b62e14cc61f00b", "chore": "5bdcd459f3b62e14cc61f00b", "status": 'approved', timeStamp: new Date().getTime() - oneDay * 14}, //reward 2
        {"id": "abdcd459f3b62e14cc61f00b", "chore": "5bdcd459f3b62e14cc61f00b", "status": 'approved', timeStamp: new Date().getTime() - oneDay * 5},
        {"id": "abdcd459f3b62e14cc61f00b", "chore": "5bdcd459f3b62e14cc61f00b", "status": 'approved', timeStamp: new Date().getTime() - oneDay * 4},
        {"id": "abdcd459f3b62e14cc61f00b", "chore": "5bdcd459f3b62e14cc61f00b", "status": 'approved', timeStamp: new Date().getTime() - oneDay * 3},
        {"id": "abd3b8bf348176460b2c7fb9", "chore": "5bd3b8bf348176460b2c7fb9", "status": 'unapproved', timeStamp: new Date().getTime() - oneDay * 1}, //reward 1  total = 21
    ],
    "delinquentChoreInstances": [
        {id: 'dbd3b8bf348176460b2c7fb9', timeStamp: new Date().getTime()-oneDay*10, chore: '5bd3b8bf348176460b2c7fb9'}, //3 priority
        {id: 'dbd3b8bf348176460b2c7fb9', timeStamp: new Date().getTime()-oneDay*8, chore: '5bd3b8bf348176460b2c7fb9'},
        {id: 'dbdcd459f3b62e14cc61f00b', timeStamp: new Date().getTime()-oneDay*7, chore: '5bdcd459f3b62e14cc61f00b'}, //2
        {id: 'dbd3b8bf348176460b2c7fb9', timeStamp: new Date().getTime()-oneDay*6, chore: '5bd3b8bf348176460b2c7fb9'},
        {id: 'dbdcd459f3b62e14cc61f00b', timeStamp: new Date().getTime()-oneDay*5, chore: '5bdcd459f3b62e14cc61f00b'},
        {id: 'dbd3b8bf348176460b2c7fb9', timeStamp: new Date().getTime()-oneDay*2, chore: '5bd3b8bf348176460b2c7fb9'},
        {id: 'dbdcd459f3b62e14cc61f00b', timeStamp: new Date().getTime()-oneDay*1, chore: '5bdcd459f3b62e14cc61f00b'}, //total missed points 18
    ],
    "_id": "5bd36ba3348176460b2c7fb4",
    "name": "Max",
    "dob": "03-25-2016",
    "gender": "male",
    "allowanceAmount": 11,
    "savingsRequired": 10,
    kreditInformation: {
        savingsRequired: 10,
        kiddieKashBalance: 9,
        rewardsRedemptions: { value: 0, denominator: 30 },
        choreHistory: { value: 0, denominator: 35 },
        avgChoreAge: { value: 0, denominator: 15 },
        totalChores: { value: 0, denominator: 10 },
        rewardsRequests: { value: 0, denominator: 10 },
        punishments: {},
    }
};
const mockEmma = {
    "assignedChores": ["5bd3b8bf348176460b2c7fb9", "5bdcd477f3b62e14cc61f00e"], //0, 2
    "eligibleRewards": ["5bd36bf9348176460b2c7fb6"],
    "rewardsRedemptions": [],
    "doneChores": [
        {"id": "abdcd477f3b62e14cc61f00e", "chore": "5bdcd477f3b62e14cc61f00e", "status": "unapproved"}
    ],
    "delinquentChoreInstances": [],
    "_id": "5bd36bca348176460b2c7fb5",
    "name": "Emma",
    "dob": "02-11-2018",
    "gender": "female",
    "kiddieKash": 0,
    "allowanceAmount": 11,
    "savingsRequired": 5
};

test('ComputeUtilization - Computes score based on not exceeding 90% of reward utilization',
    () => {
        const maxUtiliationRatio = computeUtilization(mockFamilyUnit, mockMax);
        const emmaUtilizationRatio = computeUtilization(mockFamilyUnit, mockEmma);
        expect(maxUtiliationRatio).toBe(30);
        expect(emmaUtilizationRatio).toBe(20);
    });


test('ComputeChoreHistory - Computes deduction for delinquent chores for Max and Emma',
    () => {
        const maxDelinquentChoresScore = computeChoreHistory(mockFamilyUnit, mockMax);
        const emmaDelinquentChoresScore = computeChoreHistory(mockFamilyUnit, mockEmma);
        expect(maxDelinquentChoresScore).toBe(17);
        expect(emmaDelinquentChoresScore).toBe(35);
    });

test('ComputeAvgChoreAge - Computes average chore age correctly for max and emma',
    () => {
        const maxChoresScore = computeAvgChoreAge(mockFamilyUnit, mockMax);
        const emmaChoresScore = computeAvgChoreAge(mockFamilyUnit, mockEmma);
        const maxChoreAgeDays = (
            (new Date().getTime() - mockFamilyUnit.existingChores[0].startDate) +
            (new Date().getTime() - mockFamilyUnit.existingChores[1].startDate)
        )/oneDay;
        const emmaChoreAgeDays = (
            (new Date().getTime() - mockFamilyUnit.existingChores[0].startDate) +
            (new Date().getTime() - mockFamilyUnit.existingChores[2].startDate)
        )/oneDay;
        const maxChoreAge = maxChoreAgeDays >= 42 ? 42 : Math.ceil(maxChoreAgeDays/2);
        const emmaChoreAge = emmaChoreAgeDays >= 42 ? 42 : Math.ceil(emmaChoreAgeDays/2);
        expect(maxChoresScore).toBe(15 - (42 - maxChoreAge)*0.5);
        expect(emmaChoresScore).toBe(15 - (42 - emmaChoreAge)*0.5);
    });

test('ComputeTotalChores - correctly computes number of chores for Max and Emma',
    () => {
        const maxChoresScore = computeTotalChores(mockFamilyUnit, mockMax);
        const emmaChoresScore = computeTotalChores(mockFamilyUnit, mockEmma);
        expect(maxChoresScore).toBe(4);
        expect(emmaChoresScore).toBe(4);
    });

test('computeInquiries - correctly computes point deduction for rewards requested over the past 7 days',
    () => {
        const maxRewardsRequestsScore = computeInquiries(mockFamilyUnit, mockMax);
        const emmaRewardssRequestsScore = computeInquiries(mockFamilyUnit, mockEmma);
        expect(maxRewardsRequestsScore).toBe(7);
        expect(emmaRewardssRequestsScore).toBe(10);
    });