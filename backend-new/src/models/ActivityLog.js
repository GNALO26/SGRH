const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    actor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    entity_type: {
      type: String,
      default: null
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    ip_address: {
      type: String,
      default: null
    },
    user_agent: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

activityLogSchema.index({ company_id: 1, actor_id: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);