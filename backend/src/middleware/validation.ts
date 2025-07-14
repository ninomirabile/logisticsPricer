import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validatePricingRequest = [
  body('origin').isString().notEmpty().withMessage('Origin is required'),
  body('destination').isString().notEmpty().withMessage('Destination is required'),
  body('weight').isFloat({ min: 0.01 }).withMessage('Weight must be a positive number'),
  body('volume').isFloat({ min: 0.01 }).withMessage('Volume must be a positive number'),
  body('transportType').isString().notEmpty().withMessage('Transport type is required'),
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }
    next();
  },
];

export const validateDutyCalculation = [
  body('originCountry').isString().notEmpty().withMessage('Origin country is required'),
  body('destinationCountry').isString().notEmpty().withMessage('Destination country is required'),
  body('hsCode').isString().notEmpty().withMessage('HS code is required'),
  body('productValue').isFloat({ min: 0 }).withMessage('Product value must be a positive number'),
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }
    next();
  },
];

export const validateTransitCalculation = [
  body('origin').isString().notEmpty().withMessage('Origin is required'),
  body('destination').isString().notEmpty().withMessage('Destination is required'),
  body('transportType').isString().notEmpty().withMessage('Transport type is required'),
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }
    next();
  },
];

export const validateTariffUpdate = [
  body('originCountry').isString().notEmpty().withMessage('Origin country is required'),
  body('destinationCountry').isString().notEmpty().withMessage('Destination country is required'),
  body('hsCode').isString().notEmpty().withMessage('HS code is required'),
  body('baseRate').isFloat({ min: 0, max: 100 }).withMessage('Base rate must be between 0 and 100'),
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }
    next();
  },
]; 