const mongoClient = require('mongodb').MongoClient;


async function processAllChildAllowances() {
    let connectionString = '';
    let config = {};
    try {
        config = require("../../config/database.js");
        connectionString = config.dbServerUri;
    } catch (e) {
        console.log("error reading or parsing db config file", e);
        return;
    }

    const nativemDB = await mongoClient.connect(connectionString, { useNewUrlParser: true } );
    const dbo = nativemDB.db(config.mDbName);
    const bulkOp = dbo.collection('familyunits').initializeUnorderedBulkOp();

    const cursor = dbo.collection('familyunits').find().batchSize(10000);
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        doc.kidsList.forEach((kid, kidIndex) => {
            // if (!kid.kreditInformation){
            //     const propName = `kidsList.${kidIndex}.kreditInformation`;
            //     bulkOp.find({_id: doc._id}).update({
            //         $set: {
            //             [propName]: {
            //                 kiddieKashBalance: kid.allowanceAmount
            //             }
            //         }
            //     });
            // }
            //else
            if (kid.kreditInformation) {
                let currentBalance = kid.kreditInformation.kiddieKashBalance;
                if (typeof currentBalance !== 'number') currentBalance = 0;
                const propName = `kidsList.${kidIndex}.kreditInformation.kiddieKashBalance`;
                const {utilization, choreHistory, avgChoreAge, totalChores, inquiries, punishments} = kid.kreditInformation;
                let kreditScore =  0.5;
                try {
                    kreditScore = (utilization.numerator + choreHistory.numerator + avgChoreAge.numerator + totalChores.numerator + inquiries.numerator - punishments)/100;
                }
                catch(err){
                    console.log("##########ERROR while computing kredit score!", err);
                }
                bulkOp.find({_id: doc._id}).update({
                    $set: {
                        [propName]: currentBalance + (kid.allowanceAmount * kreditScore)
                    }
                });
            }
        });

    }
    bulkOp.execute(function(err, result){
        console.log(JSON.stringify(result, null, 4));
        nativemDB.close();
    });
}

processAllChildAllowances();
