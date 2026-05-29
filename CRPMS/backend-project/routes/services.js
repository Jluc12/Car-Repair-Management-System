const express  = require('express');
const router   = express.Router();
const Service  = require('../models/Service');
const { requireAuth } = require('../middleware/auth');

const ALLOWED_FIELDS = ['serviceCode', 'serviceName', 'servicePrice', 'description'];

function pick(body) {
  const out = {};
  for (const k of ALLOWED_FIELDS) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { page, limit } = req.query;
    if (page) {
      const p = Math.max(1, parseInt(page)) || 1;
      const l = Math.min(100, Math.max(1, parseInt(limit)) || 20);
      const [data, total] = await Promise.all([
        Service.find().sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
        Service.countDocuments(),
      ]);
      return res.json({ data, total, page: p, limit: l, totalPages: Math.ceil(total / l) });
    }
    res.json(await Service.find().sort({ createdAt: -1 }));
  }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id', requireAuth, async (req, res) => {
  try { const s = await Service.findById(req.params.id); if (!s) return res.status(404).json({ message: 'Service not found.' }); res.json(s); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', requireAuth, async (req, res) => {
  try { const service = new Service(pick(req.body)); await service.save(); res.status(201).json({ message: 'Service created successfully.', service }); }
  catch (err) { if (err.code === 11000) return res.status(409).json({ message: 'Service code already exists.' }); res.status(400).json({ message: err.message }); }
});
router.put('/:id', requireAuth, async (req, res) => {
  try { const service = await Service.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true }); if (!service) return res.status(404).json({ message: 'Service not found.' }); res.json({ message: 'Service updated successfully.', service }); }
  catch (err) { if (err.code === 11000) return res.status(409).json({ message: 'Service code already exists.' }); res.status(400).json({ message: err.message }); }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try { const s = await Service.findByIdAndDelete(req.params.id); if (!s) return res.status(404).json({ message: 'Service not found.' }); res.json({ message: 'Service deleted successfully.' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;