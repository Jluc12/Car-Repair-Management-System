const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceCode:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  serviceName:        { type: String, required: true, trim: true },
  servicePrice:       { type: Number, required: true, min: 0 },
  serviceDescription: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
