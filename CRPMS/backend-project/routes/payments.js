const express  = require('express');
const router   = express.Router();
const Payment  = require('../models/Payment');
const { requireAuth } = require('../middleware/auth');
const pop = q => q.populate({ path: 'car', select: 'plateNumber type model' }).populate({ path: 'serviceRecord', populate: { path: 'service', select: 'serviceName servicePrice' } });
router.get('/', requireAuth, async (req, res) => {
  try { res.json(await pop(Payment.find().sort({ createdAt: -1 }))); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id', requireAuth, async (req, res) => {
  try { const p = await pop(Payment.findById(req.params.id)); if (!p) return res.status(404).json({ message: 'Payment not found.' }); res.json(p); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', requireAuth, async (req, res) => {
  try { const payment = new Payment(req.body); await payment.save(); res.status(201).json({ message: 'Payment recorded successfully.', payment }); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', requireAuth, async (req, res) => {
  try { const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!payment) return res.status(404).json({ message: 'Payment not found.' }); res.json({ message: 'Payment updated successfully.', payment }); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try { const p = await Payment.findByIdAndDelete(req.params.id); if (!p) return res.status(404).json({ message: 'Payment not found.' }); res.json({ message: 'Payment deleted successfully.' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;