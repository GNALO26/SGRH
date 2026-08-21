const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
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
    leave_type: {
      type: String,
      enum: ['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other'],
      required: true
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
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
    },
    rejection_reason: {
      type: String,
      default: null
    },
    documents: [
      {
        type: String,
        default: null
      }
    ]
  },
  { timestamps: true }
);

leaveSchema.index({ employee_id: 1, start_date: -1, end_date: -1 });

module.exports = mongoose.model('Leave', leaveSchema);