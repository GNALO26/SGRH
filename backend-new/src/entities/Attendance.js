const { EntitySchema } = require('typeorm');

const Attendance = new EntitySchema({
  name: 'Attendance',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    employee_id: { type: 'objectId', required: true },
    date: { type: 'date', required: true },
    check_in_time: { type: 'date', nullable: true },
    check_out_time: { type: 'date', nullable: true },
    check_in_latitude: { type: 'float', nullable: true },
    check_in_longitude: { type: 'float', nullable: true },
    check_out_latitude: { type: 'float', nullable: true },
    check_out_longitude: { type: 'float', nullable: true },
    check_in_distance_meters: { type: 'float', nullable: true },
    check_out_distance_meters: { type: 'float', nullable: true },
    status: { type: 'string', enum: ['present', 'late', 'absent', 'half_day', 'holiday', 'weekend'], default: 'present' },
    notes: { type: 'string', nullable: true },
    is_manual: { type: 'boolean', default: false },
    created_by: { type: 'objectId', nullable: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  },
  indices: [
    { name: 'idx_attendance_employee_date', columns: ['employee_id', 'date'] }
  ]
});

module.exports = Attendance;