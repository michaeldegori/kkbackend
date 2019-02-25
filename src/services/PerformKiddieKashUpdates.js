const mongoClient = require('mongodb').MongoClient;
const fs = require('fs');

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
                if (typeof currentBalance !== 'number' || isNaN(currentBalance)) currentBalance = 0;

                let allowanceAmount = kid.allowanceAmount;
                if (typeof allowanceAmount !== 'number' || isNaN(allowanceAmount)) allowanceAmount = 1;

                const propName = `kidsList.${kidIndex}.kreditInformation.kiddieKashBalance`;
                const {utilization, choreHistory, avgChoreAge, totalChores, inquiries, punishments} = kid.kreditInformation;
                let kreditScore =  0.5;
                try {
                    let actualPunishments = punishments;
                    if (typeof actualPunishments !== 'number' || isNaN(actualPunishments)) actualPunishments = 0;
                    kreditScore = (utilization.numerator + choreHistory.numerator + avgChoreAge.numerator + totalChores.numerator + inquiries.numerator - actualPunishments)/100;
                    if (isNaN(kreditScore)) kreditScore = 0.5;
                }
                catch(err){
                    console.log("##########ERROR while computing kredit score for " + kid.name + `, family unit ${doc._id}`, err);
                    return;
                }
                let newBalance = currentBalance + Math.floor(allowanceAmount * kreditScore * 100)/100;

                console.log(`Setting balance from $${currentBalance} to $${newBalance} for ${kid.name} in f.u. ${doc._id} . Kredit score ${kreditScore}`);
                bulkOp.find({_id: doc._id}).update({
                    $set: {
                        [propName]: newBalance
                    }
                });
            }
        });

    }
    bulkOp.execute(function(err, result){
        const stringifiedResult = JSON.stringify(result, null, 4);
        let home = process.env['HOME']
        if (!fs.existsSync(`${home}/kklogs/kiddieKashUpdates.log`)){
            fs.writeFile(`${home}/kklogs/kiddieKashUpdates.log`, `${new Date().toISOString()}\n${stringifiedResult}`, err => console.log('File save operation concluded, error:' + err));
        }
        else {
            fs.appendFile(`${home}/kklogs/kiddieKashUpdates.log`,
                `\n\n${new Date().toISOString()}\n${stringifiedResult}`,
                err => console.log('File save operation concluded, error:' + err))
        }
        nativemDB.close();
    });
}

processAllChildAllowances();
