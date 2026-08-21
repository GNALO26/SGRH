const { z } = require('zod');
const AppDataSource = require('../config/typeorm');
const Company = require('../entities/Company');
const PayrollSetting = require('../entities/PayrollSetting');

// Schéma de validation pour la mise à jour des réglages d'entreprise
const updateCompanySettingsSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.').optional(),
  slug: z.string().min(2).optional(),
  logo: z.string().nullable().optional(),
  plan: z.enum(['trial', 'starter', 'growth', 'enterprise']).optional(),
  is_active: z.boolean().optional(),
  trial_ends_at: z.string().nullable().optional(),
  subscription_ends_at: z.string().nullable().optional(),
  fedapay_customer_id: z.string().nullable().optional()
});

// Schéma de validation pour les réglages de paie
const payrollSettingsSchema = z.object({
  tax_rate: z.number().nonnegative().optional(),
  social_security_rate: z.number().nonnegative().optional(),
  overtime_rate: z.number().positive().optional(),
  currency: z.string().min(1).max(10).optional(),
  payday: z.number().int().min(1).max(31).optional(),
  allow_advance: z.boolean().optional(),
  advance_max_percent: z.number().nonnegative().max(100).optional()
});

/**
 * GET /api/admin/company-settings
 * Récupère les réglages de l'entreprise et les réglages de paie.
 */
async function getCompanySettings(req, res, next) {
  const companyRepository = AppDataSource.getRepository(Company);
  const payrollRepository = AppDataSource.getRepository(PayrollSetting);

  try {
    const company = await companyRepository.findOne({
      where: { _id: req.company_id }
    });

    if (!company) {
      return res.status(404).json({ message: 'Entreprise non trouvée.' });
    }

    // Récupérer ou créer les réglages de paie
    let payrollSetting = await payrollRepository.findOne({
      where: { company_id: req.company_id }
    });

    if (!payrollSetting) {
      payrollSetting = payrollRepository.create({
        company_id: req.company_id,
        tax_rate: 0,
        social_security_rate: 0,
        overtime_rate: 1.5,
        currency: 'XOF',
        payday: 30,
        allow_advance: false,
        advance_max_percent: 30
      });
      await payrollRepository.save(payrollSetting);
    }

    return res.status(200).json({
      company: {
        name: company.name,
        slug: company.slug,
        logo: company.logo,
        plan: company.plan,
        is_active: company.is_active,
        trial_ends_at: company.trial_ends_at,
        subscription_ends_at: company.subscription_ends_at,
        fedapay_customer_id: company.fedapay_customer_id,
        created_at: company.createdAt,
        updated_at: company.updatedAt
      },
      payroll: payrollSetting
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/company-settings
 * Met à jour les réglages de l'entreprise et éventuellement les réglages de paie.
 */
async function updateCompanySettings(req, res, next) {
  const companyRepository = AppDataSource.getRepository(Company);
  const payrollRepository = AppDataSource.getRepository(PayrollSetting);

  try {
    const companyData = updateCompanySettingsSchema.parse(req.body);
    const payrollData = payrollSettingsSchema.partial().parse(req.body.payroll || {});

    // Mettre à jour l'entreprise
    const company = await companyRepository.findOne({
      where: { _id: req.company_id }
    });

    if (!company) {
      return res.status(404).json({ message: 'Entreprise non trouvée.' });
    }

    if (companyData.name !== undefined) company.name = companyData.name;
    if (companyData.slug !== undefined) company.slug = companyData.slug;
    if (companyData.logo !== undefined) company.logo = companyData.logo;
    if (companyData.plan !== undefined) company.plan = companyData.plan;
    if (companyData.is_active !== undefined) company.is_active = companyData.is_active;
    if (companyData.trial_ends_at !== undefined) {
      company.trial_ends_at = companyData.trial_ends_at ? new Date(companyData.trial_ends_at) : null;
    }
    if (companyData.subscription_ends_at !== undefined) {
      company.subscription_ends_at = companyData.subscription_ends_at ? new Date(companyData.subscription_ends_at) : null;
    }
    if (companyData.fedapay_customer_id !== undefined) company.fedapay_customer_id = companyData.fedapay_customer_id;

    await companyRepository.save(company);

    // Mettre à jour ou créer les réglages de paie
    let payrollSetting = await payrollRepository.findOne({
      where: { company_id: req.company_id }
    });

    if (!payrollSetting) {
      payrollSetting = payrollRepository.create({
        company_id: req.company_id,
        tax_rate: payrollData.tax_rate !== undefined ? payrollData.tax_rate : 0,
        social_security_rate: payrollData.social_security_rate !== undefined ? payrollData.social_security_rate : 0,
        overtime_rate: payrollData.overtime_rate !== undefined ? payrollData.overtime_rate : 1.5,
        currency: payrollData.currency !== undefined ? payrollData.currency : 'XOF',
        payday: payrollData.payday !== undefined ? payrollData.payday : 30,
        allow_advance: payrollData.allow_advance !== undefined ? payrollData.allow_advance : false,
        advance_max_percent: payrollData.advance_max_percent !== undefined ? payrollData.advance_max_percent : 30
      });
    } else {
      if (payrollData.tax_rate !== undefined) payrollSetting.tax_rate = payrollData.tax_rate;
      if (payrollData.social_security_rate !== undefined) payrollSetting.social_security_rate = payrollData.social_security_rate;
      if (payrollData.overtime_rate !== undefined) payrollSetting.overtime_rate = payrollData.overtime_rate;
      if (payrollData.currency !== undefined) payrollSetting.currency = payrollData.currency;
      if (payrollData.payday !== undefined) payrollSetting.payday = payrollData.payday;
      if (payrollData.allow_advance !== undefined) payrollSetting.allow_advance = payrollData.allow_advance;
      if (payrollData.advance_max_percent !== undefined) payrollSetting.advance_max_percent = payrollData.advance_max_percent;
    }

    await payrollRepository.save(payrollSetting);

    return res.status(200).json({
      message: 'Réglages mis à jour.',
      company: {
        name: company.name,
        slug: company.slug,
        logo: company.logo,
        plan: company.plan,
        is_active: company.is_active,
        trial_ends_at: company.trial_ends_at,
        subscription_ends_at: company.subscription_ends_at,
        fedapay_customer_id: company.fedapay_customer_id
      },
      payroll: payrollSetting
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

module.exports = {
  getCompanySettings,
  updateCompanySettings
};