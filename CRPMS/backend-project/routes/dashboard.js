const express       = require('express');
const router        = express.Router();
const Car           = require('../models/Car');
const Service       = require('../models/Service');
const ServiceRecord = require('../models/ServiceRecord');
const Payment       = require('../models/Payment');
const { requireAuth } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [totalCars, totalServices, totalRecords, totalPayments] = await Promise.all([
      Car.countDocuments(),
      Service.countDocuments(),
      ServiceRecord.countDocuments(),
      Payment.countDocuments(),
    ]);

    // Payment status breakdown for pie chart
    const paymentBreakdown = await ServiceRecord.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
    ]);

    // Revenue: sum of amountPaid across all service records
    const revenueAgg = await ServiceRecord.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$amountPaid' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Recent 5 service records
    const recentRecords = await ServiceRecord.find()
      .populate('car', 'plateNumber model')
      .populate('service', 'serviceName servicePrice')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await ServiceRecord.aggregate([
      { $match: { serviceDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: '$serviceDate' },
            month: { $month: '$serviceDate' },
          },
          revenue: { $sum: '$amountPaid' },
          count:   { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      totalCars,
      totalServices,
      totalRecords,
      totalPayments,
      totalRevenue,
      paymentBreakdown,
      recentRecords,
      monthlyRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
