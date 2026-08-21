const { EntitySchema } = require('typeorm');

const Notification = new EntitySchema({
  name: 'Notification',
  columns: {
    _id: { type: 'objectId', primary: true, generated: true },
    company_id: { type: 'objectId', required: true },
    recipient_id: { type: 'objectId', required: true },
    title: { type: 'string', required: true },
    body: { type: 'string', nullable: true },
    type: { type: 'string', enum: ['attendance', 'leave', 'document', 'system', 'payment'], default: 'system' },
    is_read: { type: 'boolean', default: false },
    read_at: { type: 'date', nullable: true },
    data: { type: 'simple-json', nullable: true },
    createdAt: { type: 'date', createDate: true },
    updatedAt: { type: 'date', updateDate: true }
  },
  indices: [
    { name: 'idx_notification_recipient_read', columns: ['recipient_id', 'is_read'] }
  ]
});

module.exports = Notification;