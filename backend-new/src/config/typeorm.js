const { DataSource } = require('typeorm');
const config = require('./index');

// Import des entités
const Company = require('../entities/Company');
const User = require('../entities/User');
const Attendance = require('../entities/Attendance');
const Leave = require('../entities/Leave');
const RetardAuthorization = require('../entities/RetardAuthorization');
const UnjustifiedAbsence = require('../entities/UnjustifiedAbsence');
const Holiday = require('../entities/Holiday');
const Document = require('../entities/Document');
const Notification = require('../entities/Notification');
const ActivityLog = require('../entities/ActivityLog');
const AssistanceRequest = require('../entities/AssistanceRequest');
const PayrollSetting = require('../entities/PayrollSetting');

const AppDataSource = new DataSource({
  type: 'mongodb',
  url: config.mongodb.uri,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  entities: [
    Company,
    User,
    Attendance,
    Leave,
    RetardAuthorization,
    UnjustifiedAbsence,
    Holiday,
    Document,
    Notification,
    ActivityLog,
    AssistanceRequest,
    PayrollSetting
  ],
  synchronize: config.env === 'development' ? true : false,
  logging: false
});

module.exports = AppDataSource;