const {processFamilyUnit} = require('./KreditCalculation/ProcessFamilyUnit');
const mongoClient = require('mongodb').MongoClient;

const updates = [];
/**
 * BulkWrite needs format:
 * { updateOne :
            {
               "filter" : { "char" : "Eldon" },
               "update" : { $set : { "status" : "Critical Injury" } }
            }
         }
 */



(async function(){
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
        // updates.push(updateObjectFactory(doc._id, {location: doc.location + "|processed1"}))
        const processedFamilyUnitDiff = processFamilyUnit(doc);
        bulkOp.find({_id: doc._id}).update({
            $set: processedFamilyUnitDiff
        });
    }
    bulkOp.execute(function(err, result){
        console.log(JSON.stringify(result, null, 4));
        nativemDB.close();
    });
})();
