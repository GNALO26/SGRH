const mongoose = require('mongoose');

const payrollSettingSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    tax_rate: {
      type: Number,
      default: 0
    },
    social_security_rate: {
      type: Number,
      default: 0
    },
    overtime_rate: {
      type: Number,
      default: 1.5
    },
    currency: {
      type: String,
      default: 'XOF'
    },
    payday: {
      type: Number,
      min: 1,
      max: 31,
      default: 30
    },
    allow_advance: {
      type: Boolean,
      default: false
    },
    advance_max_percent: {
      type: Number,
      default: 30
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PayrollSetting', payrollSettingSchema);