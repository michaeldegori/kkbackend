const mongoose = require('mongoose');


module.exports = function(app, FamilyUnit, Advert) {

  const getChildAge = (dobStr) => {
    const dobArray = dobStr.split("-");
    const dobYear = dobArray[2].parseInt();
    const year = now.getFullYear();
    const kidAge = year - dobYear;
    return kidAge;
  }

  // get adverts based on user characteristics: number of kids, ages of kids, userlocation 
  // from Advert
  app.get('/advert', async (req, res) => {
    try {
      const adverts = await Advert.find()
      res.json(adverts)
    } catch (err) {
      res.status(500).json({message: err.message})
    }
  });

  app.get('/advert', async (req, res) => {
    try {
      let adverts = await Advert.findOne({loc: req.advert.coordinates});
      if (adverts) {
        Advert.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [ x, y ]
              },
              distanceField: "dist.calculated",
              maxDistance: 15,
              spherical: true
            }
          }
        ], (err, data) => {
          if (err) {
            next(err);
            return;
          }
          res.send(data);
        })
      }
    }
    catch(err) {
      res.json({err: err.message});
    }
  });

  app.post('/advert', async (req, res) => {
    const newAdvert = new Advert({
      _id: new ObjectId(),
      companyName: req.body.companyName,
      productImg: req.body.productImg,
      logo: req.body.logo,
      productName: req.body.productName,
      content: req.body.content,
      bid: req.body.bid,
      userInfo:
        {
          email: req.body.email,
          ageMin: req.body.ageMin,
          ageMax: req.body.ageMax,
          famSize: req.body.famSize,
          loc: req.body.loc
        }
        
    });
    try {
      const saveResult = await newAdvert.save();
      res.status(201).json({ saveResult });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  })

  async function getAdvert(req, res, next) {
    let advert;
    try {
      advert = await Advert.findById(req.params.id);
      if (!advert) {
        return res.status(404).json({ message: "Advert not found"});
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
    res.advert = advert;
    next();
  }

  app.put('/:id', getAdvert, async (req, res) => {

  });

  app.patch('/:id', getAdvert, async (req, res) => {
    if (!req.body.companyName) {
      res.advert.companyName = req.body.companyName;
    }
    if (!req.body.productImg) {
      res.advert.productImg = req.body.productImg;
    }
    if (!req.body.logo) {
      res.advert.logo = req.body.logo;
    }
    if (!req.body.productName) {
      res.advert.productName = req.body.productName;
    }
    if (!req.body.content) {
      res.advert.content = req.body.content;
    }
    if (!req.body.bid) {
      res.advert.bid = req.body.bid;
    }
    if (!req.body.userInfo) {
      res.advert.userInfo = req.body.userInfo;
    }
    try {
      const updatedAdvert = await res.adver.save();
      res.json(updatedAdvert);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete('advert/:id', getAdvert, async (req, res) => {
    try {
      await res.advert.deleteOne();
      res.json({ message: "Advert has been deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}