const { EntitySchema } = require('typeorm');

const Company = new EntitySchema({
  name: 'Company',
  columns: {
    _id: {
      type: 'objectId',
      primary: true,
      generated: true
    },
    name: { type: 'string', required: true },
    slug: { type: 'string', unique: true, required: true },
    logo: { type: 'string', nullable: true },
    plan: { type: 'string', enum: ['trial', 'starter', 'growth', 'enterprise'], default: 'trial' },
    is_active: { type: 'boolean', default: true },
    trial_ends_at: { type: 'date', nullable: true },
    subscription_ends_at: { type: 'date', nullable: true },
    fedapay_customer_id: { type: 'string', nullable: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  }
});

module.exports = Company;