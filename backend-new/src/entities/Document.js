const { EntitySchema } = require('typeorm');

const Document = new EntitySchema({
  name: 'Document',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    employee_id: { type: 'objectId', required: true },
    title: { type: 'string', required: true },
    file_url: { type: 'string', required: true },
    file_public_id: { type: 'string', nullable: true },
    category: { type: 'string', default: 'other' },
    uploaded_by: { type: 'objectId', nullable: true },
    visible_to_employee: { type: 'boolean', default: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  },
  indices: [
    { name: 'idx_document_employee_category', columns: ['employee_id', 'category'] }
  ]
});

module.exports = Document;