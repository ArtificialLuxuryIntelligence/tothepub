const mongoose = require('mongoose');

const { Schema } = mongoose;

// note: no properties set as required: (??? -set placeholders to avoid missing props?)
// must take care when returning serverside OR consuming this data clientside
const pointLocationSchema = new Schema({
  type: { type: String },
  properties: {
    name: { type: String },
    phone: { type: String },
    website: { type: String },
    "opening-hours": { type: String },
    tags: { type: Array },

  },
  geometry: {
    type: { type: String },
    coordinates: { type: Array },
  },
  edited: { type: Boolean, default: false },
});

// it seems both are needed?
pointLocationSchema.index({ 'geometry.coordinates': '2dsphere' });
pointLocationSchema.index({ geometry: '2dsphere' });

const pointLocation = mongoose.model('pointLocation', pointLocationSchema);

module.exports = pointLocation;
