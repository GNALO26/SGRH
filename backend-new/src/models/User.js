const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
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
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee'
    },
    company_latitude: {
      type: Number,
      default: null
    },
    company_longitude: {
      type: Number,
      default: null
    },
    geofence_radius_meters: {
      type: Number,
      default: 200
    },
    official_opening_time: {
      type: String,
      default: '08:00'
    },
    official_closing_time: {
      type: String,
      default: '17:00'
    },
    base_salary: {
      type: Number,
      default: 0
    },
    matricule: {
      type: String,
      trim: true,
      default: null
    },
    position: {
      type: String,
      trim: true,
      default: null
    },
    department: {
      type: String,
      trim: true,
      default: null
    },
    last_login_at: {
      type: Date,
      default: null
    },
    avatar_url: {
      type: String,
      default: null
    },
    fcm_token: {
      type: String,
      default: null
    },
    two_factor_code: {
      type: String,
      default: null
    },
    two_factor_expires_at: {
      type: Date,
      default: null
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index composé pour garantir l'unicité de l'email par entreprise si nécessaire
userSchema.index({ company_id: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);