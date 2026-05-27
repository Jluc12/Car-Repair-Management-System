const express       = require('express');
const router        = express.Router();
const ServiceRecord = require('../models/ServiceRecord');
const { requireAuth } = require('../middleware/auth');

// GET all service records (with populated refs)
router.get('/', requireAuth, async (req, res) => {
  try {
    const records = await ServiceRecord.find()
      .populate('car', 'plateNumber type model driverPhone mechanicName')
      .populate('service', 'serviceCode serviceName servicePrice')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single service record
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const record = await ServiceRecord.findById(req.params.id)
      .populate('car')
      .populate('service');
    if (!record) return res.status(404).json({ message: 'Service record not found.' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create service record
router.post('/', requireAuth, async (req, res) => {
  try {
    const record = new ServiceRecord(req.body);
    await record.save();
    const populated = await record.populate(['car', 'service']);
    res.status(201).json({ message: 'Service record created successfully.', record: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update service record
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const record = await ServiceRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('car').populate('service');
    if (!record) return res.status(404).json({ message: 'Service record not found.' });
    res.json({ message: 'Service record updated successfully.', record });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE service record
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const record = await ServiceRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Service record not found.' });
    res.json({ message: 'Service record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
