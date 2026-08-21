const { z } = require('zod');
const AppDataSource = require('../config/typeorm');
const Holiday = require('../entities/Holiday');
const ActivityLog = require('../entities/ActivityLog');

const createHolidaySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Date invalide.'
  }),
  is_recurring: z.boolean().optional().default(false),
  description: z.string().optional().nullable()
});

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide.')
});

async function listHolidays(req, res, next) {
  const holidayRepository = AppDataSource.getRepository(Holiday);
  try {
    const holidays = await holidayRepository.find({
      where: { company_id: req.company_id },
      order: { date: 'ASC' }
    });
    return res.status(200).json({ holidays });
  } catch (error) {
    next(error);
  }
}

async function listHolidaysAdmin(req, res, next) {
  const holidayRepository = AppDataSource.getRepository(Holiday);
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { company_id: req.company_id };
    if (req.query.year) {
      const year = parseInt(req.query.year, 10);
      const start = new Date(`${year}-01-01T00:00:00Z`);
      const end = new Date(`${year + 1}-01-01T00:00:00Z`);
      filter.date = { $gte: start, $lt: end };
    }

    const [holidays, total] = await Promise.all([
      holidayRepository.find({
        where: filter,
        order: { date: 'ASC' },
        skip,
        take: limit
      }),
      holidayRepository.count({ where: filter })
    ]);

    return res.status(200).json({
      data: holidays,
      meta: {
        current_page: page,
        last_page: Math.ceil(total / limit),
        total,
        per_page: limit
      }
    });
  } catch (error) {
    next(error);
  }
}

async function createHoliday(req, res, next) {
  const holidayRepository = AppDataSource.getRepository(Holiday);
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const data = createHolidaySchema.parse(req.body);

    const holiday = holidayRepository.create({
      company_id: req.company_id,
      name: data.name,
      date: new Date(data.date),
      is_recurring: data.is_recurring || false,
      description: data.description || null
    });

    await holidayRepository.save(holiday);

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'holiday.created',
        entity_type: 'Holiday',
        entity_id: holiday._id,
        metadata: { name: holiday.name, date: holiday.date }
      })
    );

    return res.status(201).json({
      message: 'Jour férié créé avec succès.',
      holiday
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Erreur de validation.',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
}

async function deleteHoliday(req, res, next) {
  const holidayRepository = AppDataSource.getRepository(Holiday);
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const { id } = idParamSchema.parse(req.params);

    const holiday = await holidayRepository.findOne({
      where: { _id: id, company_id: req.company_id }
    });

    if (!holiday) {
      return res.status(404).json({ message: 'Jour férié non trouvé.' });
    }

    await holidayRepository.remove(holiday);

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'holiday.deleted',
        entity_type: 'Holiday',
        entity_id: holiday._id,
        metadata: { name: holiday.name }
      })
    );

    return res.status(200).json({ message: 'Jour férié supprimé.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Erreur de validation.',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
}

module.exports = {
  listHolidays,
  listHolidaysAdmin,
  createHoliday,
  deleteHoliday
};