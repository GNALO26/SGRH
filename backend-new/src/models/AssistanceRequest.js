const mongoose = require('mongoose');

const assistanceRequestSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    response: {
      type: String,
      default: null
    },
    responded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    responded_at: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

assistanceRequestSchema.index({ employee_id: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('AssistanceRequest', assistanceRequestSchema);