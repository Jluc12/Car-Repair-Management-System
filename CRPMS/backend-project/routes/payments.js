const express  = require('express');
const router   = express.Router();
const Payment  = require('../models/Payment');
const { requireAuth } = require('../middleware/auth');

const ALLOWED_FIELDS = ['serviceRecord', 'car', 'paymentDate', 'receivedBy', 'amountPaid'];

function pick(body) {
  const out = {};
  for (const k of ALLOWED_FIELDS) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

const pop = q => q.populate({ path: 'car', select: 'plateNumber type model' }).populate({ path: 'serviceRecord', populate: { path: 'service', select: 'serviceName servicePrice' } });
router.get('/', requireAuth, async (req, res) => {
  try {
    const { page, limit } = req.query;
    if (page) {
      const p = Math.max(1, parseInt(page)) || 1;
      const l = Math.min(100, Math.max(1, parseInt(limit)) || 20);
      const [data, total] = await Promise.all([
        pop(Payment.find().sort({ createdAt: -1 }).skip((p - 1) * l).limit(l)),
        Payment.countDocuments(),
      ]);
      return res.json({ data, total, page: p, limit: l, totalPages: Math.ceil(total / l) });
    }
    res.json(await pop(Payment.find().sort({ createdAt: -1 })));
  }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id', requireAuth, async (req, res) => {
  try { const p = await pop(Payment.findById(req.params.id)); if (!p) return res.status(404).json({ message: 'Payment not found.' }); res.json(p); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', requireAuth, async (req, res) => {
  try { const payment = new Payment(pick(req.body)); await payment.save(); res.status(201).json({ message: 'Payment recorded successfully.', payment }); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', requireAuth, async (req, res) => {
  try { const payment = await Payment.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true }); if (!payment) return res.status(404).json({ message: 'Payment not found.' }); res.json({ message: 'Payment updated successfully.', payment }); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try { const p = await Payment.findByIdAndDelete(req.params.id); if (!p) return res.status(404).json({ message: 'Payment not found.' }); res.json({ message: 'Payment deleted successfully.' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;