const express = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const employeeRoutes = require('./employee.routes');
const internalController = require('../controllers/internalController');
const holidayController = require('../controllers/holidayController');
const { auth } = require('../middleware/auth');
const { tenant } = require('../middleware/tenant');
const { globalLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Limiteur global
router.use(globalLimiter);

// Route de santé
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes d'authentification
router.use('/', authRoutes);

// Route commune pour les jours fériés (accessible à tous les rôles)
router.get('/holidays', auth, tenant, holidayController.listHolidays);

// Routes internes (protégées par clé API)
router.post('/internal/trigger-absences', internalController.triggerAbsences);

// Routes d'administration
router.use('/admin', adminRoutes);

// Routes employé
router.use('/employee', employeeRoutes);

module.exports = router;