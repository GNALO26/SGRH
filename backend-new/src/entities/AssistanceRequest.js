const { EntitySchema } = require('typeorm');

const AssistanceRequest = new EntitySchema({
  name: 'AssistanceRequest',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    employee_id: { type: 'objectId', required: true },
    subject: { type: 'string', required: true },
    description: { type: 'string', required: true },
    status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    response: { type: 'string', nullable: true },
    responded_by: { type: 'objectId', nullable: true },
    responded_at: { type: 'date', nullable: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  },
  indices: [
    { name: 'idx_assistance_employee_status', columns: ['employee_id', 'status'] }
  ]
});

module.exports = AssistanceRequest;