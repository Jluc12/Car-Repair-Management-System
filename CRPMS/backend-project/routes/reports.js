const express       = require('express');
const router        = express.Router();
const ServiceRecord = require('../models/ServiceRecord');
const { requireAuth } = require('../middleware/auth');

// GET Service Bill — by plateNumber or all
// Returns: PlateNumber, ServiceName, ServiceDate, ServicePrice, AmountPaid, PaymentStatus, PaymentDate
router.get('/service-bill', requireAuth, async (req, res) => {
  try {
    const { plateNumber } = req.query;
    let query = {};

    const records = await ServiceRecord.find(query)
      .populate('car', 'plateNumber type model mechanicName driverPhone')
      .populate('service', 'serviceName servicePrice serviceCode')
      .sort({ serviceDate: -1 });

    let filtered = records;
    if (plateNumber) {
      filtered = records.filter(r =>
        r.car && r.car.plateNumber.toLowerCase().includes(plateNumber.toLowerCase())
      );
    }

    const bill = filtered.map(r => ({
      _id:           r._id,
      plateNumber:   r.car?.plateNumber,
      carModel:      r.car?.model,
      mechanicName:  r.car?.mechanicName,
      serviceCode:   r.service?.serviceCode,
      serviceName:   r.service?.serviceName,
      servicePrice:  r.service?.servicePrice,
      serviceDate:   r.serviceDate,
      amountPaid:    r.amountPaid,
      paymentStatus: r.paymentStatus,
      paymentDate:   r.paymentDate,
    }));

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Daily Service Payment Report
// Returns: PlateNumber, ServiceName, ServiceDate, AmountPaid — filtered by date
router.get('/daily-payments', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    let start, end;

    if (date) {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else {
      // Default: today
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    const records = await ServiceRecord.find({
      serviceDate: { $gte: start, $lte: end },
    })
      .populate('car', 'plateNumber')
      .populate('service', 'serviceName servicePrice')
      .sort({ serviceDate: -1 });

    const report = records.map(r => ({
      _id:         r._id,
      plateNumber: r.car?.plateNumber,
      serviceName: r.service?.serviceName,
      serviceDate: r.serviceDate,
      amountPaid:  r.amountPaid,
    }));

    const totalCollected = report.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

    res.json({ date: date || new Date().toISOString().split('T')[0], totalCollected, records: report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
