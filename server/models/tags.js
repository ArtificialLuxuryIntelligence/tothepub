const mongoose = require('mongoose');

const { Schema } = mongoose;

const tagsSchema = new Schema({
  tags: { type: Array },
});

const tags = mongoose.model('tags', tagsSchema);
module.exports = tags;
