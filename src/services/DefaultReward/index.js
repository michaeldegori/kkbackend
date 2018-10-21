const mongoose = require('mongoose');

exports.routeFactory = async function (app, User, Reward){
    app.get('/defaultrewards', async (req, res) => {
        const rewards = await Reward.find();
        console.log(rewards);
        res.json(rewards);
    });


    /**
     * default data
     */
    let r = await Reward.findOne({_id: '5bb6f007c4e3fbec080f63b9'});
    if (r) return;

    r = new Reward({
        _id: new mongoose.Types.ObjectId('5bb6f007c4e3fbec080f63b9'),
        name: "Go to bed late",
        kkCost: 15,
        notes: ""
    });
    r.save().then(console.log);
};


module.exports = exports;