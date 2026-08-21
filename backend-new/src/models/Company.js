const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true
    },
    logo: {
      type: String,
      default: null
    },
    plan: {
      type: String,
      enum: ['trial', 'starter', 'growth', 'enterprise'],
      default: 'trial'
    },
    is_active: {
      type: Boolean,
      default: true
    },
    trial_ends_at: {
      type: Date,
      default: null
    },
    subscription_ends_at: {
      type: Date,
      default: null
    },
    fedapay_customer_id: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);