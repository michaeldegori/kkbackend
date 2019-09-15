const mongoose = require("mongoose");
const fetch = require('node-fetch');

module.exports = function(app) {

  // get adverts based on user characteristics: number of kids, ages of kids, userlocation 
  // from advertisers campaigns
  app.get('/advert', async (req, res) => {
    if (!req.query.latitude || !req.query.longitude || !req.query.email) 
      return res.status(400).json({message: 'illegal request'});

    const ipAddress = req.ip;
    if(!ipAddress) return res.status(400).json({message: 'unable to get ip address'});
    console.log(ipAddress)

    const requestURL = 'http://localhost:8080'
    // had this hardcoded in, but wanted to make it clear that this url may need to be changed

    try {
    const advert = await fetch(`http://aj2263.online/ads-api?clientIp=${ipAddress}`
    + `&requestUrl=${requestURL}&format=json&key=13ac80de3da2825eca448542a09f1925`
    + `&latitude=${latitude}&longitude=${longitude}&email=${email}`, {
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
    });
    if (!advert) return res.status(404).json({message: "advert not found"})

    let jsonifiedAdvert = await advert.json()
    console.log(jsonifiedAdvert)
    if(jsonifiedAdvert) 
      return res.status(200).json({
        creative: jsonifiedAdvert.creative, 
        click: jsonifiedAdvert.click, 
        beacon: jsonifiedAdvert.beacon
      })
    
    res.json({
        jsonifiedAdvert
    });

    } catch (err) {
      console.log(err)
      res.status(500).json({ message: err.message });
    }
  });

}