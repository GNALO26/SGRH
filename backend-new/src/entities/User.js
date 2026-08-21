const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
  name: 'User',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    name: { type: 'string', required: true },
    email: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true },
    role: { type: 'string', enum: ['admin', 'employee'], default: 'employee' },
    company_latitude: { type: 'float', nullable: true },
    company_longitude: { type: 'float', nullable: true },
    geofence_radius_meters: { type: 'int', default: 200 },
    official_opening_time: { type: 'string', default: '08:00' },
    official_closing_time: { type: 'string', default: '17:00' },
    base_salary: { type: 'float', default: 0 },
    matricule: { type: 'string', nullable: true },
    position: { type: 'string', nullable: true },
    department: { type: 'string', nullable: true },
    last_login_at: { type: 'date', nullable: true },
    avatar_url: { type: 'string', nullable: true },
    fcm_token: { type: 'string', nullable: true },
    two_factor_code: { type: 'string', nullable: true },
    two_factor_expires_at: { type: 'date', nullable: true },
    is_active: { type: 'boolean', default: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  },
  indices: [
    { name: 'idx_user_company_email', columns: ['company_id', 'email'], unique: true }
  ]
});

module.exports = User;