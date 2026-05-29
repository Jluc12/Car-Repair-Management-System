const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const ServiceRecord = require('../models/ServiceRecord');
const Car = require('../models/Car');
const { requireAuth } = require('../middleware/auth');

router.get('/recent', requireAuth, async (req, res) => {
  try {
    const [payments, records, cars] = await Promise.all([
      Payment.find().populate('car', 'plateNumber').populate({ path: 'serviceRecord', populate: { path: 'service', select: 'serviceName' } }).sort({ createdAt: -1 }).limit(5).lean(),
      ServiceRecord.find().populate('car', 'plateNumber').populate('service', 'serviceName').sort({ createdAt: -1 }).limit(5).lean(),
      Car.find().sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    const notifications = [];

    payments.forEach(p => {
      notifications.push({
        id: 'pay_' + p._id,
        type: 'payment',
        icon: 'payment',
        message: `Payment received — ${p.car?.plateNumber || 'Unknown'} (${p.serviceRecord?.service?.serviceName || 'N/A'})`,
        amount: p.amountPaid,
        time: p.createdAt,
        read: false,
      });
    });

    records.forEach(r => {
      const isPaid = r.paymentStatus === 'Paid';
      notifications.push({
        id: 'sr_' + r._id,
        type: isPaid ? 'service_paid' : 'service_record',
        icon: isPaid ? 'check' : 'info',
        message: isPaid
          ? `Service completed & paid — ${r.car?.plateNumber || 'Unknown'} (${r.service?.serviceName || 'N/A'})`
          : `Service record ${r.paymentStatus.toLowerCase()} — ${r.car?.plateNumber || 'Unknown'} (${r.service?.serviceName || 'N/A'})`,
        time: r.createdAt,
        read: false,
      });
    });

    cars.forEach(c => {
      notifications.push({
        id: 'car_' + c._id,
        type: 'car',
        icon: 'car',
        message: `New car registered — ${c.plateNumber} (${c.model})`,
        time: c.createdAt,
        read: false,
      });
    });

    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    const latest = notifications.slice(0, 10);

    res.json({
      notifications: latest,
      total: latest.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
