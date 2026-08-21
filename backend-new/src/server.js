require('dotenv').config();
const app = require('./app');
const AppDataSource = require('./config/typeorm');
const { absenceQueue } = require('./services/queueService');
require('./jobs'); // Initialiser les processeurs des queues
require('./cron/absenceCron'); // Démarrer la tâche planifiée

const PORT = process.env.PORT || 8000;

AppDataSource.initialize()
  .then(() => {
    console.log('Connexion MongoDB (TypeORM) établie');
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error('Erreur de connexion MongoDB', err);
    process.exit(1);
  });