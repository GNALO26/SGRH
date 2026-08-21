const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const leaveController = require('../controllers/leaveController');
const retardAuthorizationController = require('../controllers/retardAuthorizationController');
const unjustifiedAbsenceController = require('../controllers/unjustifiedAbsenceController');
const documentController = require('../controllers/documentController');
const notificationController = require('../controllers/notificationController');
const assistanceController = require('../controllers/assistanceController');
const { auth } = require('../middleware/auth');
const { tenant } = require('../middleware/tenant');

const router = express.Router();

router.use(auth);
router.use(tenant);

// Pointage
router.post('/attendance', attendanceController.createAttendance);
router.get('/attendance/today', attendanceController.getTodayAttendance);
router.get('/attendance/history', attendanceController.getAttendanceHistory);
router.get('/attendance/export', attendanceController.exportAttendance);

// Congés
router.post('/leaves', leaveController.createLeaveEmployee);
router.get('/leaves', leaveController.listLeavesEmployee);
router.delete('/leaves/:id', leaveController.deleteLeaveEmployee);

// Autorisations de retard
router.post('/retard-authorizations', retardAuthorizationController.createRetardEmployee);
router.get('/retard-authorizations', retardAuthorizationController.listRetardEmployee);
router.delete('/retard-authorizations/:id', retardAuthorizationController.deleteRetardEmployee);

// Absences non justifiées
router.get('/unjustified-absences', unjustifiedAbsenceController.listAbsencesEmployee);
router.post('/unjustified-absences/:id/explain', unjustifiedAbsenceController.explainAbsenceEmployee);

// Documents
router.get('/documents', documentController.listDocumentsEmployee);

// Notifications
router.get('/notifications', notificationController.listNotificationsEmployee);
router.post('/notifications/read', notificationController.markNotificationsReadEmployee);

// Assistance
router.post('/assistance', assistanceController.createAssistance);
router.get('/assistance', assistanceController.listAssistanceEmployee);

module.exports = router;