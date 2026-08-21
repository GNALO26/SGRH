const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true
    },
    file_url: {
      type: String,
      required: true
    },
    file_public_id: {
      type: String,
      default: null
    },
    category: {
      type: String,
      default: 'other'
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    visible_to_employee: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

documentSchema.index({ employee_id: 1, category: 1 });

module.exports = mongoose.model('Document', documentSchema);