// scripts/seedCategories.js
const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config({ path: '../.env' });

const defaultCategories = [
  { name: 'Food & Dining', color: '#FF5733' },
  { name: 'Transportation', color: '#33FF57' },
  { name: 'Housing', color: '#3357FF' },
  { name: 'Entertainment', color: '#F033FF' },
  { name: 'Shopping', color: '#FF9F33' },
  { name: 'Utilities', color: '#33FFF0' },
  { name: 'Healthcare', color: '#FF33A8' },
  { name: 'Personal', color: '#A833FF' },
  { name: 'Education', color: '#33A1FF' },
  { name: 'Other', color: '#B5B5B5' }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if categories already exist
    const count = await Category.countDocuments();
    
    if (count === 0) {
      // Insert default categories
      await Category.insertMany(defaultCategories);
      console.log('Default categories added successfully');
    } else {
      console.log('Categories already exist, skipping seed');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedCategories();
}

module.exports = seedCategories;