// routes/dashboard.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transactions');
const mongoose = require('mongoose');

// Get dashboard data
router.get('/', async (req, res) => {
  try {
    // Get total expenses
    const totalExpenses = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Get category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $unwind: '$categoryData'
      },
      {
        $group: {
          _id: '$category',
          categoryName: { $first: '$categoryData.name' },
          categoryColor: { $first: '$categoryData.color' },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get monthly expenses (for the current year)
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = await Transaction.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .populate('category', 'name color')
      .sort({ date: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
        categoryBreakdown,
        monthlyExpenses,
        recentTransactions
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Get monthly data for chart
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();
    
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${targetYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);

    // Format the data for the chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map((month, index) => {
      const monthData = monthlyData.find(item => item._id.month === index + 1);
      return {
        month,
        amount: monthData ? monthData.total : 0
      };
    });

    return res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Get category data for pie chart
router.get('/categories', async (req, res) => {
  try {
    const categoryData = await Transaction.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $unwind: '$categoryData'
      },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryData.name' },
          color: { $first: '$categoryData.color' },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: categoryData
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router;