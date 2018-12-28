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
            if (!kid[kidIndex].kreditInformation){
                const propName = `kidsList.${kidIndex}.kreditInformation`;
                bulkOp.find({_id: doc._id}).update({
                    $set: {
                        [propName]: {
                            kiddieKashBalance: kid.allowanceAmount
                        }
                    }
                });
            }
            else {
                let currentBalance = doc.kreditInformation.kiddieKashBalance;
                const propName = `kidsList.${kidIndex}.kreditInformation.kiddieKashBalance`;
                if (typeof currentBalance !== 'number') currentBalance = 0;
                bulkOp.find({_id: doc._id}).update({
                    $set: {
                        [propName]: currentBalance + kid.allowanceAmount
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
