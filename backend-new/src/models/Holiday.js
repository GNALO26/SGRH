const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    is_recurring: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

holidaySchema.index({ company_id: 1, date: 1 });

module.exports = mongoose.model('Holiday', holidaySchema);