const { EntitySchema } = require('typeorm');

const UnjustifiedAbsence = new EntitySchema({
  name: 'UnjustifiedAbsence',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    employee_id: { type: 'objectId', required: true },
    date: { type: 'date', required: true },
    explanation: { type: 'string', nullable: true },
    explanation_submitted_at: { type: 'date', nullable: true },
    status: { type: 'string', enum: ['unexplained', 'explained', 'accepted', 'rejected'], default: 'unexplained' },
    resolved_by: { type: 'objectId', nullable: true },
    resolved_at: { type: 'date', nullable: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  },
  indices: [
    { name: 'idx_absence_employee_date', columns: ['employee_id', 'date'] }
  ]
});

module.exports = UnjustifiedAbsence;