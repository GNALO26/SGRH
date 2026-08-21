const { z } = require('zod');
const AppDataSource = require('../config/typeorm');
const Document = require('../entities/Document');
const ActivityLog = require('../entities/ActivityLog');
const cloudinary = require('../config/cloudinary');

const createDocumentSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères.'),
  category: z.string().optional().default('other'),
  employee_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant employé invalide.').optional(),
  file_base64: z.string().min(1, 'Le fichier en base64 est requis.'),
  file_name: z.string().min(1, 'Le nom du fichier est requis.')
});

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide.')
});

async function createDocument(req, res, next) {
  const documentRepository = AppDataSource.getRepository(Document);
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const data = createDocumentSchema.parse(req.body);

    if (!data.employee_id) {
      return res.status(422).json({ message: 'employee_id est requis.' });
    }

    const uploadResult = await cloudinary.uploader.upload(
      `data:application/octet-stream;base64,${data.file_base64}`,
      {
        folder: 'naohr/documents',
        public_id: `${req.company_id}_${Date.now()}`,
        resource_type: 'auto'
      }
    );

    const document = documentRepository.create({
      company_id: req.company_id,
      employee_id: data.employee_id,
      title: data.title,
      file_url: uploadResult.secure_url,
      file_public_id: uploadResult.public_id,
      category: data.category,
      uploaded_by: req.user._id,
      visible_to_employee: true
    });

    await documentRepository.save(document);

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'document.created',
        entity_type: 'Document',
        entity_id: document._id,
        metadata: { title: document.title, employee_id: data.employee_id }
      })
    );

    return res.status(201).json({
      message: 'Document créé avec succès.',
      document
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

async function listDocumentsAdmin(req, res, next) {
  const documentRepository = AppDataSource.getRepository(Document);
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { company_id: req.company_id };
    if (req.query.employee_id) filter.employee_id = req.query.employee_id;
    if (req.query.category) filter.category = req.query.category;

    const [documents, total] = await Promise.all([
      documentRepository.find({
        where: filter,
        order: { createdAt: 'DESC' },
        skip,
        take: limit
      }),
      documentRepository.count({ where: filter })
    ]);

    return res.status(200).json({
      data: documents,
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

async function listDocumentsEmployee(req, res, next) {
  const documentRepository = AppDataSource.getRepository(Document);
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {
      company_id: req.company_id,
      employee_id: req.user._id,
      visible_to_employee: true
    };
    if (req.query.category) filter.category = req.query.category;

    const [documents, total] = await Promise.all([
      documentRepository.find({
        where: filter,
        order: { createdAt: 'DESC' },
        skip,
        take: limit
      }),
      documentRepository.count({ where: filter })
    ]);

    return res.status(200).json({
      data: documents,
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

async function deleteDocument(req, res, next) {
  const documentRepository = AppDataSource.getRepository(Document);
  const activityRepository = AppDataSource.getRepository(ActivityLog);
  try {
    const { id } = idParamSchema.parse(req.params);

    const document = await documentRepository.findOne({
      where: { _id: id, company_id: req.company_id }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    if (document.file_public_id) {
      try {
        await cloudinary.uploader.destroy(document.file_public_id);
      } catch (cloudinaryError) {
        console.error('Erreur Cloudinary lors de la suppression:', cloudinaryError);
      }
    }

    await documentRepository.remove(document);

    await activityRepository.save(
      activityRepository.create({
        company_id: req.company_id,
        actor_id: req.user._id,
        action: 'document.deleted',
        entity_type: 'Document',
        entity_id: document._id,
        metadata: { title: document.title }
      })
    );

    return res.status(200).json({ message: 'Document supprimé.' });
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
  createDocument,
  listDocumentsAdmin,
  listDocumentsEmployee,
  deleteDocument
};