const { EntitySchema } = require('typeorm');

const ActivityLog = new EntitySchema({
  name: 'ActivityLog',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    actor_id: { type: 'objectId', required: true },
    action: { type: 'string', required: true },
    entity_type: { type: 'string', nullable: true },
    entity_id: { type: 'objectId', nullable: true },
    metadata: { type: 'simple-json', nullable: true },
    ip_address: { type: 'string', nullable: true },
    user_agent: { type: 'string', nullable: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  },
  indices: [
    { name: 'idx_activity_company_actor', columns: ['company_id', 'actor_id'] }
  ]
});

module.exports = ActivityLog;