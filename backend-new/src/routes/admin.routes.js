const express = require('express');
const employeeController = require('../controllers/employeeController');
const leaveController = require('../controllers/leaveController');
const retardAuthorizationController = require('../controllers/retardAuthorizationController');
const unjustifiedAbsenceController = require('../controllers/unjustifiedAbsenceController');
const holidayController = require('../controllers/holidayController');
const documentController = require('../controllers/documentController');
const notificationController = require('../controllers/notificationController');
const assistanceController = require('../controllers/assistanceController');
const attendanceController = require('../controllers/attendanceController');
const dashboardController = require('../controllers/dashboardController');
const companySettingsController = require('../controllers/companySettingsController');
const { auth } = require('../middleware/auth');
const { tenant } = require('../middleware/tenant');

const router = express.Router();

router.use(auth);
router.use(tenant);

// Dashboard
router.get('/dashboard', dashboardController.getAdminDashboard);

// Réglages entreprise
router.get('/company-settings', companySettingsController.getCompanySettings);
router.put('/company-settings', companySettingsController.updateCompanySettings);

// Gestion des employés
router.post('/employees', employeeController.createEmployee);
router.get('/employees', employeeController.listEmployees);
router.get('/employees/:id', employeeController.getEmployee);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);
router.patch('/employees/:id/password', employeeController.changeEmployeePassword);

// Pointages (admin)
router.get('/attendances', attendanceController.listAttendancesAdmin);

// Gestion des congés
router.post('/leaves', leaveController.createLeaveAdmin);
router.get('/leaves', leaveController.listLeavesAdmin);
router.patch('/leaves/:id', leaveController.updateLeaveStatusAdmin);

// Gestion des autorisations de retard
router.post('/retard-authorizations', retardAuthorizationController.createRetardAdmin);
router.get('/retard-authorizations', retardAuthorizationController.listRetardAdmin);
router.patch('/retard-authorizations/:id', retardAuthorizationController.updateRetardStatusAdmin);

// Gestion des absences non justifiées
router.get('/unjustified-absences', unjustifiedAbsenceController.listAbsencesAdmin);
router.get('/unjustified-absences/:id', unjustifiedAbsenceController.getAbsenceAdmin);

// Jours fériés
router.post('/holidays', holidayController.createHoliday);
router.get('/holidays', holidayController.listHolidaysAdmin);
router.delete('/holidays/:id', holidayController.deleteHoliday);

// Documents
router.post('/documents', documentController.createDocument);
router.get('/documents', documentController.listDocumentsAdmin);
router.delete('/documents/:id', documentController.deleteDocument);

// Notifications
router.get('/notifications', notificationController.listNotificationsAdmin);
router.post('/notifications/read', notificationController.markNotificationsReadAdmin);

// Assistance
router.get('/assistance-requests', assistanceController.listAssistanceAdmin);
router.patch('/assistance-requests/:id/respond', assistanceController.respondAssistance);

module.exports = router;