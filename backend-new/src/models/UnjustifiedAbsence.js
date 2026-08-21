const mongoose = require('mongoose');

const unjustifiedAbsenceSchema = new mongoose.Schema(
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
    explanation: {
      type: String,
      default: null
    },
    explanation_submitted_at: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['unexplained', 'explained', 'accepted', 'rejected'],
      default: 'unexplained'
    },
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolved_at: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

unjustifiedAbsenceSchema.index({ employee_id: 1, date: -1 });

module.exports = mongoose.model('UnjustifiedAbsence', unjustifiedAbsenceSchema);