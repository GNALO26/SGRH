const { EntitySchema } = require('typeorm');

const Holiday = new EntitySchema({
  name: 'Holiday',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    name: { type: 'string', required: true },
    date: { type: 'date', required: true },
    is_recurring: { type: 'boolean', default: false },
    description: { type: 'string', nullable: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  },
  indices: [
    { name: 'idx_holiday_company_date', columns: ['company_id', 'date'] }
  ]
});

module.exports = Holiday;