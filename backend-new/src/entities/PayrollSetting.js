const { EntitySchema } = require('typeorm');

const PayrollSetting = new EntitySchema({
  name: 'PayrollSetting',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    tax_rate: { type: 'float', default: 0 },
    social_security_rate: { type: 'float', default: 0 },
    overtime_rate: { type: 'float', default: 1.5 },
    currency: { type: 'string', default: 'XOF' },
    payday: { type: 'int', default: 30 },
    allow_advance: { type: 'boolean', default: false },
    advance_max_percent: { type: 'float', default: 30 },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  }
});

module.exports = PayrollSetting;