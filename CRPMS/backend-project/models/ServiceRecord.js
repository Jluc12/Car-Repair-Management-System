const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
  car:           { type: mongoose.Schema.Types.ObjectId, ref: 'Car',     required: true },
  service:       { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  serviceDate:   { type: Date, required: true, default: Date.now },
  amountPaid:    { type: Number, required: true, min: 0 },
  paymentDate:   { type: Date },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Partial', 'Unpaid'],
    default: 'Unpaid',
  },
}, { timestamps: true });

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
