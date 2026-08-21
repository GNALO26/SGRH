const bcrypt = require('bcryptjs');
const { z } = require('zod');
const AppDataSource = require('../config/typeorm');
const User = require('../entities/User');
const ActivityLog = require('../entities/ActivityLog');

const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().email('Email invalide.'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
  role: z.enum(['admin', 'employee']).default('employee'),
  matricule: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  base_salary: z.number().nonnegative().optional().default(0),
  company_latitude: z.number().optional().nullable(),
  company_longitude: z.number().optional().nullable(),
  geofence_radius_meters: z.number().positive().optional().default(200),
  official_opening_time: z.string().optional().default('08:00'),
  official_closing_time: z.string().optional().default('17:00')
});

const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'employee']).optional(),
  matricule: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  base_salary: z.number().nonnegative().optional(),
  company_latitude: z.number().nullable().optional(),
  company_longitude: z.number().nullable().optional(),
  geofence_radius_meters: z.number().positive().optional(),
  official_opening_time: z.string().optional(),
  official_closing_time: z.string().optional()
});

const changePasswordSchema = z.object({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.')
});

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide.')
});

function generateMatricule() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `EMP-${year}-${random}`;
}

function formatEmployee(user) {
  return {
    id: user._id,
    company_id: user.company_id,
    name: user.name,
    email: user.email,
    role: user.role,
    matricule: user.matricule,
    position: user.position,
    department: user.department,
    base_salary: user.base_salary,
    company_latitude: user.company_latitude,
    company_longitude: user.company_longitude,
    geofence_radius_meters: user.geofence_radius_meters,
    official_opening_time: user.official_opening_time,
    official_closing_time: user.official_closing_time,
    avatar_url: user.avatar_url,
    last_login_at: user.last_login_at,
    created_at: user.createdAt,
    updated_at: user.updatedAt
  };
}

async function createEmployee(req, res, next) {
  const userRepository = AppDataSource.getRepository(User);
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const data = createEmployeeSchema.parse(req.body);

    const existingUser = await userRepository.findOne({ where: { email: data.email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const matricule = data.matricule || generateMatricule();

    const employee = userRepository.create({
      company_id: req.company_id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role,
      matricule,
      position: data.position || null,
      department: data.department || null,
      base_salary: data.base_salary || 0,
      company_latitude: data.company_latitude || null,
      company_longitude: data.company_longitude || null,
      geofence_radius_meters: data.geofence_radius_meters || 200,
      official_opening_time: data.official_opening_time || '08:00',
      official_closing_time: data.official_closing_time || '17:00'
    });

    await userRepository.save(employee);

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'employee.created',
        entity_type: 'User',
        entity_id: employee._id,
        metadata: { email: employee.email }
      })
    );

    return res.status(201).json({
      message: 'Employé créé avec succès.',
      employee: formatEmployee(employee)
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

async function listEmployees(req, res, next) {
  const userRepository = AppDataSource.getRepository(User);
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { company_id: req.company_id };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { matricule: searchRegex }
      ];
    }

    if (req.query.role) {
      filter.role = req.query.role;
    }

    const [employees, total] = await Promise.all([
      userRepository.find({
        where: filter,
        order: { createdAt: 'DESC' },
        skip,
        take: limit
      }),
      userRepository.count({ where: filter })
    ]);

    return res.status(200).json({
      data: employees.map(formatEmployee),
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

async function getEmployee(req, res, next) {
  const userRepository = AppDataSource.getRepository(User);
  try {
    const { id } = idParamSchema.parse(req.params);
    const employee = await userRepository.findOne({ where: { _id: id, company_id: req.company_id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé.' });
    }
    return res.status(200).json({ employee: formatEmployee(employee) });
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

async function updateEmployee(req, res, next) {
  const userRepository = AppDataSource.getRepository(User);
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateEmployeeSchema.parse(req.body);

    const employee = await userRepository.findOne({ where: { _id: id, company_id: req.company_id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé.' });
    }

    if (data.name !== undefined) employee.name = data.name;
    if (data.email !== undefined) {
      const emailLower = data.email.toLowerCase();
      const emailExists = await userRepository.findOne({ where: { email: emailLower, _id: { $ne: id } } });
      if (emailExists) {
        return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
      }
      employee.email = emailLower;
    }
    if (data.role !== undefined) employee.role = data.role;
    if (data.matricule !== undefined) employee.matricule = data.matricule;
    if (data.position !== undefined) employee.position = data.position;
    if (data.department !== undefined) employee.department = data.department;
    if (data.base_salary !== undefined) employee.base_salary = data.base_salary;
    if (data.company_latitude !== undefined) employee.company_latitude = data.company_latitude;
    if (data.company_longitude !== undefined) employee.company_longitude = data.company_longitude;
    if (data.geofence_radius_meters !== undefined) employee.geofence_radius_meters = data.geofence_radius_meters;
    if (data.official_opening_time !== undefined) employee.official_opening_time = data.official_opening_time;
    if (data.official_closing_time !== undefined) employee.official_closing_time = data.official_closing_time;

    await userRepository.save(employee);

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'employee.updated',
        entity_type: 'User',
        entity_id: employee._id,
        metadata: { updated_fields: Object.keys(data) }
      })
    );

    return res.status(200).json({
      message: 'Employé mis à jour.',
      employee: formatEmployee(employee)
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

async function deleteEmployee(req, res, next) {
  const userRepository = AppDataSource.getRepository(User);
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const { id } = idParamSchema.parse(req.params);
    const employee = await userRepository.findOne({ where: { _id: id, company_id: req.company_id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé.' });
    }
    await userRepository.remove(employee);

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'employee.deleted',
        entity_type: 'User',
        entity_id: employee._id,
        metadata: { email: employee.email }
      })
    );

    return res.status(200).json({ message: 'Employé supprimé.' });
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

async function changeEmployeePassword(req, res, next) {
  const userRepository = AppDataSource.getRepository(User);
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const { id } = idParamSchema.parse(req.params);
    const { password } = changePasswordSchema.parse(req.body);

    const employee = await userRepository.findOne({ where: { _id: id, company_id: req.company_id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    employee.password = hashedPassword;
    await userRepository.save(employee);

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'employee.password_changed',
        entity_type: 'User',
        entity_id: employee._id,
        metadata: { email: employee.email }
      })
    );

    return res.status(200).json({ message: 'Mot de passe mis à jour.' });
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
  createEmployee,
  listEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  changeEmployeePassword
};