const cron = require('node-cron');
const AppDataSource = require('../config/typeorm');
const Company = require('../entities/Company');
const { absenceQueue } = require('../services/queueService');

const schedule = '0 18 * * *';

cron.schedule(schedule, async () => {
  console.log('Démarrage de la détection quotidienne des absences...');

  try {
    const companyRepository = AppDataSource.getRepository(Company);
    const companies = await companyRepository.find({ where: { is_active: true } });

    for (const company of companies) {
      await absenceQueue.add({
        companyId: company._id,
        targetDate: new Date()
      });
    }

    console.log(`${companies.length} entreprises ajoutées à la file de détection d'absences.`);
  } catch (error) {
    console.error('Erreur lors de la planification de la détection des absences:', error);
  }
});

module.exports = {};