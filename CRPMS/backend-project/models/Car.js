const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  plateNumber:       { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:              { type: String, required: true, trim: true },
  model:             { type: String, required: true, trim: true },
  manufacturingYear: { type: Number, required: true, min: 1900, max: new Date().getFullYear() + 1 },
  driverPhone:       { type: String, required: true, trim: true },
  mechanicName:      { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
