const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  color: {
    type: String,
    default: '#000000'
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);