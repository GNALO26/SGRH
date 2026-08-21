const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
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
    check_in_time: {
      type: Date,
      default: null
    },
    check_out_time: {
      type: Date,
      default: null
    },
    check_in_latitude: {
      type: Number,
      default: null
    },
    check_in_longitude: {
      type: Number,
      default: null
    },
    check_out_latitude: {
      type: Number,
      default: null
    },
    check_out_longitude: {
      type: Number,
      default: null
    },
    check_in_distance_meters: {
      type: Number,
      default: null
    },
    check_out_distance_meters: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'half_day', 'holiday', 'weekend'],
      default: 'present'
    },
    notes: {
      type: String,
      default: null
    },
    is_manual: {
      type: Boolean,
      default: false
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Index pour la recherche rapide par employé et date
attendanceSchema.index({ employee_id: 1, date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);