const express = require('express');
const router  = express.Router();
const Car     = require('../models/Car');
const { requireAuth } = require('../middleware/auth');
router.get('/', requireAuth, async (req, res) => {
  try { res.json(await Car.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id', requireAuth, async (req, res) => {
  try { const c = await Car.findById(req.params.id); if (!c) return res.status(404).json({ message: 'Car not found.' }); res.json(c); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', requireAuth, async (req, res) => {
  try { const car = new Car(req.body); await car.save(); res.status(201).json({ message: 'Car added successfully.', car }); }
  catch (err) { if (err.code === 11000) return res.status(409).json({ message: 'Plate number already exists.' }); res.status(400).json({ message: err.message }); }
});
router.put('/:id', requireAuth, async (req, res) => {
  try { const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!car) return res.status(404).json({ message: 'Car not found.' }); res.json({ message: 'Car updated successfully.', car }); }
  catch (err) { if (err.code === 11000) return res.status(409).json({ message: 'Plate number already exists.' }); res.status(400).json({ message: err.message }); }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try { const car = await Car.findByIdAndDelete(req.params.id); if (!car) return res.status(404).json({ message: 'Car not found.' }); res.json({ message: 'Car deleted successfully.' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;