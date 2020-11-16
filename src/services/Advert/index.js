
module.exports = function(app, email, dob, location) {

  // get adverts based on user characteristics: number of kids, ages of kids, userlocation 
  // from advertisers campaigns
  app.get('/advertisers/:advertiserId/campaigns', async (req, res) => {
    let currentUser = await User.findOne({auth0ID: req.user.sub})
    try {
        const campaigns = await fetch('https://nXXXX.epom.com/rest-api', {
          method: 'GET',
          headers: {
            'Authorization': '[api-key]',
            'Accept': 'application/json'
          },
        });
        if (!campaigns) return res.status(404).json({err: 'Campaigns not found'});
        // check if there is email, dob or location that matches with the campaign
        if (email || dob || location) {
          const targetAdvert = await campaigns.find({email: currentUser.email, location: currentUser.location, dob: currentUser.dob});
          if (!targetAdvert) return res.status(404).json({err: 'Advert not found'});
        } 
        // const targetToLocation = await campaigns.findOne({location: currentUser.location})
        // const targetToDob = await campaigns.findOne({dob: currentUser.dob})
          
        res.json({
          campaigns,
          targetadvert
        });

    } catch (err) {
      console.log(err)
      res.status(500).json({ message: err.message });
    }
  });
  
}
