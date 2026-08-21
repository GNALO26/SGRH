const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      default: null
    },
    type: {
      type: String,
      enum: ['attendance', 'leave', 'document', 'system', 'payment'],
      default: 'system'
    },
    is_read: {
      type: Boolean,
      default: false
    },
    read_at: {
      type: Date,
      default: null
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

notificationSchema.index({ recipient_id: 1, is_read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);