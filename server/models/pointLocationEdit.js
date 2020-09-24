const mongoose = require('mongoose');

const { Schema } = mongoose;

// note: no properties set as required: (??? -set placeholders to avoid missing props?)
// must take care when returning serverside OR consuming this data clientside
const pointLocationEditSchema = new Schema({
  refId: { type: String },
  type: { type: String },
  properties: {
    name: { type: String },
    phone: { type: String },
    website: { type: String },
    'opening-hours': { type: String },
    tags: { type: Array },
    comments: { type: String },
  },
  geometry: {
    type: { type: String },
    coordinates: { type: Array },
  },
  edited: { type: Boolean, default: false },
});

// it seems both are needed?
pointLocationEditSchema.index({ 'geometry.coordinates': '2dsphere' });
pointLocationEditSchema.index({ geometry: '2dsphere' });

const pointLocationEdit = mongoose.model(
  'pointLocationEdit',
  pointLocationEditSchema
);

module.exports = pointLocationEdit;
