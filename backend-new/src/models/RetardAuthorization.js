const mongoose = require('mongoose');

const retardAuthorizationSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approved_at: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

retardAuthorizationSchema.index({ employee_id: 1, date: -1 });

module.exports = mongoose.model('RetardAuthorization', retardAuthorizationSchema);