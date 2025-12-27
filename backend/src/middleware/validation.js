const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    throw new ValidationError('Validation failed', formattedErrors);
  }
  next();
};

const userValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'manager', 'technician']).withMessage('Invalid role'),
    validate
  ],
  update: [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'manager', 'technician']).withMessage('Invalid role'),
    validate
  ],
  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ]
};

const teamValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Team name is required'),
    validate
  ],
  update: [
    body('name').optional().trim().notEmpty().withMessage('Team name cannot be empty'),
    validate
  ],
  addMember: [
    body('user_id').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    validate
  ]
};

const equipmentValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Equipment name is required'),
    body('serial_number').trim().notEmpty().withMessage('Serial number is required'),
    body('purchase_date').optional().isISO8601().withMessage('Invalid purchase date'),
    body('warranty_end').optional().isISO8601().withMessage('Invalid warranty end date'),
    body('location').optional().trim(),
    body('department_or_owner').optional().trim(),
    body('maintenance_team_id').optional().isInt({ min: 1 }).withMessage('Invalid team ID'),
    validate
  ],
  update: [
    body('name').optional().trim().notEmpty().withMessage('Equipment name cannot be empty'),
    body('serial_number').optional().trim().notEmpty().withMessage('Serial number cannot be empty'),
    body('purchase_date').optional().isISO8601().withMessage('Invalid purchase date'),
    body('warranty_end').optional().isISO8601().withMessage('Invalid warranty end date'),
    body('maintenance_team_id').optional().isInt({ min: 1 }).withMessage('Invalid team ID'),
    body('is_scrapped').optional().isBoolean().withMessage('is_scrapped must be boolean'),
    validate
  ]
};

const maintenanceRequestValidation = {
  create: [
    body('type').isIn(['Corrective', 'Preventive']).withMessage('Type must be Corrective or Preventive'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('equipment_id').isInt({ min: 1 }).withMessage('Valid equipment ID is required'),
    body('maintenance_team_id').optional().isInt({ min: 1 }).withMessage('Invalid maintenance team ID'),
    body('assigned_technician_id').optional().isInt({ min: 1 }).withMessage('Invalid technician ID'),
    body('scheduled_date').optional().isISO8601().withMessage('Invalid scheduled date'),
    body('duration_hours').optional().isFloat({ min: 0 }).withMessage('Duration must be positive'),
    body('description').optional().trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    validate
  ],
  update: [
    body('type').optional().isIn(['Corrective', 'Preventive']).withMessage('Type must be Corrective or Preventive'),
    body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
    body('maintenance_team_id').optional().isInt({ min: 1 }).withMessage('Invalid maintenance team ID'),
    body('assigned_technician_id').optional({ nullable: true }).custom((value) => {
      if (value !== null && value !== undefined && (!Number.isInteger(value) || value < 1)) {
        throw new Error('assigned_technician_id must be a positive integer or null');
      }
      return true;
    }),
    body('scheduled_date').optional().isISO8601().withMessage('Invalid scheduled date'),
    body('duration_hours').optional().isFloat({ min: 0 }).withMessage('Duration must be positive'),
    body('description').optional().trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    validate
  ],
  updateStatus: [
    body('status').isIn(['New', 'In Progress', 'Repaired', 'Scrap']).withMessage('Invalid status'),
    validate
  ],
  assign: [
    body('technician_id')
      .optional({ nullable: true })
      .custom((value) => {
        if (value !== null && (!Number.isInteger(value) || value < 1)) {
          throw new Error('technician_id must be a positive integer or null');
        }
        return true;
      }),
    validate
  ],
  getByDate: [
    query('start_date').optional().isISO8601().withMessage('Valid start date format required (ISO 8601)'),
    query('end_date').optional().isISO8601().withMessage('Valid end date format required (ISO 8601)'),
    validate
  ]
};

const idParam = [
  param('id').isInt({ min: 1 }).withMessage('Valid ID is required'),
  validate
];

module.exports = {
  validate,
  userValidation,
  teamValidation,
  equipmentValidation,
  maintenanceRequestValidation,
  idParam
};
