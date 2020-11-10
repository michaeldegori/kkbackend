const mongoose = require('mongoose');
const {Schema} = mongoose;

const AdvertSchema = new Schema({
  companyName: { type: String, required: true },
  productImg: { type: String, required: false },
  logo: { type: String, required: true },
  productName: { type: String, required: true }, 
  content: [{ type: String, required: false }],
  ageMin: { type: Number, required: true }, 
  ageMax: { type: Number, required: true },
  bid: { type: Number, required: true },
  targets: [{
    email: [{ type: String, required: true }],
    childAge: [{type: Number, required: false}],  
    loc: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number] },
      required: false
    },
  }],
})

module.exports = function(db){
  return db.model('Advert', AdvertSchema);
};