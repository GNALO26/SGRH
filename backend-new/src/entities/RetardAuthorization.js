const { EntitySchema } = require('typeorm');

const RetardAuthorization = new EntitySchema({
  name: 'RetardAuthorization',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    employee_id: { type: 'objectId', required: true },
    date: { type: 'date', required: true },
    reason: { type: 'string', required: true },
    status: { type: 'string', enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approved_by: { type: 'objectId', nullable: true },
    approved_at: { type: 'date', nullable: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  },
  indices: [
    { name: 'idx_retard_employee_date', columns: ['employee_id', 'date'] }
  ]
});

module.exports = RetardAuthorization;