const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  serviceRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRecord', required: true },
  car:           { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  paymentDate:   { type: Date, required: true, default: Date.now },
  receivedBy:    { type: String, required: true, trim: true },
  amountPaid:    { type: Number, required: true, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
