
const allowedAdminEmails = [
    'marjvic@gmail.com',
    'info@kiddiekredit.com'
];
exports.routeFactory = async function(app, User, ParentDashboardEI, KidDashboardEI) {
    const supportedClientRoutes = {
        'kidkreditdashboard': KidDashboardEI,
        'parentkreditdashboard': ParentDashboardEI
    };
    app.get('/educationalinfo/:clientroute', async (req,res) => {
        const rte = req.params.clientroute;
        if (!supportedClientRoutes[rte]) return res.status(404).json({message: `${rte} not found`});

        try{
            const dbResult = await supportedClientRoutes[rte].findOne();
            res.json(dbResult||{
                utilization: '',
                paymentHistory: '',
                accountAge: '',
                numAccounts: '',
                creditInquiries: '',
                derogatoryMarks: '',
            });
        }
        catch(err){
            res.status(500).json({message: "Something went wrong with query"});
        }
    });

    app.put('/educationalinfo/:clientroute', async (req,res) => {
        const rte = req.params.clientroute;
        if (!supportedClientRoutes[rte]) return res.status(404).json({message: `${rte} not found`});
        if (Object.keys(req.body).length === 0) return res.status(400).json({message: `empty request body`});

        const user = await User.findOne({auth0ID: req.user.sub});
        if (allowedAdminEmails.indexOf(user.email.toLowerCase()) === -1)
            return res.status(403).json({message: 'Current user does not have access rights to edit educational information'});

        try{
            let doc = await supportedClientRoutes[rte].findOne();
            if (!doc) doc = new supportedClientRoutes[rte](req.body);
            else Object.assign(doc, req.body);

            const update = await doc.save();
            res.json(update);
        }
        catch(err){
            res.status(500).json({message: "Something went wrong with query"});
        }
    });
};

module.exports = exports;