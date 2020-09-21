const mongoose = require('mongoose');

const { Schema } = mongoose;

// note: no properties set as required: (??? -set placeholders to avoid missing props?)
// must take care when returning serverside OR consuming this data clientside
const pointLocationSchema = new Schema({
  type: { type: String },
  properties: {
    name: { type: String },
    amenity: { type: String },
    phone: { type: String },
  },
  geometry: {
    type: { type: String },
    coordinates: { type: Array },
  },
});

// name: { type: String },
// amenity: { type: String },
// phone: { type: String },
// coordinates: { type: Array, required: true },

const pointLocation = mongoose.model('pointLocation', pointLocationSchema);

module.exports = pointLocation;
