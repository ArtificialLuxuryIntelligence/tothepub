const mongoose = require('mongoose');

const { Schema } = mongoose;

const tagCategorySchema = new Schema({
  category: { type: String },
  editDisplay: { type: String },
  tags: { type: Array },
});

const tagCategory = mongoose.model('tagCategory', tagCategorySchema);
module.exports = tagCategory;
