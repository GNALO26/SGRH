const { EntitySchema } = require('typeorm');

const Leave = new EntitySchema({
  name: 'Leave',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    employee_id: { type: 'objectId', required: true },
    leave_type: { type: 'string', enum: ['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other'], required: true },
    start_date: { type: 'date', required: true },
    end_date: { type: 'date', required: true },
    reason: { type: 'string', nullable: true },
    status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
    approved_by: { type: 'objectId', nullable: true },
    approved_at: { type: 'date', nullable: true },
    rejection_reason: { type: 'string', nullable: true },
    documents: { type: 'simple-array', nullable: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  },
  indices: [
    { name: 'idx_leave_employee_dates', columns: ['employee_id', 'start_date', 'end_date'] }
  ]
});

module.exports = Leave;