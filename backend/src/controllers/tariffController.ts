import { Request, Response } from 'express';
import TariffRate from '../models/TariffRate';
import DutyCalculation from '../models/DutyCalculation';

// Get tariff rates for a specific country pair and HS code
export const getTariffRates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originCountry, destinationCountry, hsCode } = req.query;
    
    if (!originCountry || !destinationCountry || !hsCode) {
      res.status(400).json({
        success: false,
        error: { message: 'originCountry, destinationCountry, and hsCode are required' }
      });
      return;
    }
    
    const tariffs = await TariffRate.find({
      originCountry: (originCountry as string).toUpperCase(),
      destinationCountry: (destinationCountry as string).toUpperCase(),
      hsCode: hsCode as string,
      isActive: true,
      effectiveDate: { $lte: new Date() },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } }
      ]
    }).sort({ effectiveDate: -1 });
    
    res.status(200).json({
      success: true,
      data: tariffs,
      count: tariffs.length
    });
  } catch (error: unknown) {
    console.error('Error getting tariff rates:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error retrieving tariff rates' }
    });
  }
};

// Search HS codes by description
export const searchHSCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    if (!query) {
      res.status(400).json({
        success: false,
        error: { message: 'Search query is required' }
      });
      return;
    }
    
    // This would typically integrate with an external HS code database
    // For now, we'll return sample data based on common patterns
    const sampleHSCodes = [
      { code: '8517.13.00', description: 'Smartphones and mobile phones', category: 'Electronics' },
      { code: '8471.30.01', description: 'Portable computers and laptops', category: 'Electronics' },
      { code: '6104.43.20', description: 'Women\'s dresses of synthetic fibres', category: 'Textiles' },
      { code: '9503.00.00', description: 'Toys and games', category: 'Toys' },
      { code: '7326.90.86', description: 'Steel products and articles', category: 'Metals' },
      { code: '8528.72.00', description: 'Television receivers', category: 'Electronics' },
      { code: '8516.72.00', description: 'Microwave ovens', category: 'Appliances' },
      { code: '9504.50.00', description: 'Video game consoles', category: 'Electronics' }
    ];
    
    const filteredCodes = sampleHSCodes.filter(item =>
      item.description.toLowerCase().includes((query as string).toLowerCase()) ||
      item.code.includes(query as string) ||
      item.category.toLowerCase().includes((query as string).toLowerCase())
    );
    
    res.status(200).json({
      success: true,
      data: filteredCodes,
      count: filteredCodes.length
    });
  } catch (error: unknown) {
    console.error('Error searching HS codes:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error searching HS codes' }
    });
  }
};

// Calculate duties for a specific shipment
export const calculateDuties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originCountry, destinationCountry, hsCode, productValue } = req.body;
    
    if (!originCountry || !destinationCountry || !hsCode || !productValue) {
      res.status(400).json({
        success: false,
        error: { message: 'originCountry, destinationCountry, hsCode, and productValue are required' }
      });
      return;
    }
    
    // Get applicable tariff rates
    const tariffRates = await TariffRate.find({
      originCountry: originCountry.toUpperCase(),
      destinationCountry: destinationCountry.toUpperCase(),
      hsCode,
      isActive: true,
      effectiveDate: { $lte: new Date() },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } }
      ]
    }).sort({ effectiveDate: -1 }).limit(1);
    
    let baseDuty = 0;
    let specialTariffs = 0;
    const appliedRates: Array<{
      tariffId: string;
      rate: number;
      type: 'base' | 'special';
      description: string;
    }> = [];
    
    if (tariffRates.length > 0) {
      const rate = tariffRates[0];
      if (rate) {
        baseDuty = (productValue * rate.baseRate) / 100;
        specialTariffs = rate.specialRate ? (productValue * rate.specialRate) / 100 : 0;
        
        appliedRates.push({
          tariffId: rate._id?.toString() || '',
          rate: rate.baseRate,
          type: 'base',
          description: rate.notes || 'Standard tariff rate'
        });
        
        if (rate.specialRate) {
          appliedRates.push({
            tariffId: rate._id?.toString() || '',
            rate: rate.specialRate,
            type: 'special',
            description: 'Special tariff rate'
          });
        }
      }
    }
    
    const totalDuties = baseDuty + specialTariffs;
    
    // Save duty calculation
    const dutyCalculation = new DutyCalculation({
      requestId: `manual-${Date.now()}`,
      originCountry: originCountry.toUpperCase(),
      destinationCountry: destinationCountry.toUpperCase(),
      hsCode,
      productValue,
      baseDuty: Math.round(baseDuty * 100) / 100,
      specialDuty: Math.round(specialTariffs * 100) / 100,
      totalDuty: Math.round(totalDuties * 100) / 100,
      appliedRates
    });
    
    await dutyCalculation.save();
    
    res.status(200).json({
      success: true,
      data: {
        baseDuty: Math.round(baseDuty * 100) / 100,
        specialTariffs: Math.round(specialTariffs * 100) / 100,
        totalDuties: Math.round(totalDuties * 100) / 100,
        appliedRates,
        calculationId: dutyCalculation._id
      }
    });
  } catch (error: unknown) {
    console.error('Error calculating duties:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error calculating duties' }
    });
  }
};

// Get tariff change history
export const getTariffHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originCountry, destinationCountry, hsCode, limit = 50 } = req.query;
    
    const query: Record<string, unknown> = { isActive: true };
    
    if (originCountry) query.originCountry = (originCountry as string).toUpperCase();
    if (destinationCountry) query.destinationCountry = (destinationCountry as string).toUpperCase();
    if (hsCode) query.hsCode = hsCode;
    
    const tariffs = await TariffRate.find(query)
      .sort({ effectiveDate: -1 })
      .limit(parseInt(limit as string))
      .select('-__v');
    
    res.status(200).json({
      success: true,
      data: tariffs,
      count: tariffs.length
    });
  } catch (error: unknown) {
    console.error('Error getting tariff history:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error retrieving tariff history' }
    });
  }
};

// Update tariff rates (admin function)
export const updateTariffRates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originCountry, destinationCountry, hsCode, baseRate, specialRate, effectiveDate, notes } = req.body;
    
    if (!originCountry || !destinationCountry || !hsCode || baseRate === undefined) {
      res.status(400).json({
        success: false,
        error: { message: 'originCountry, destinationCountry, hsCode, and baseRate are required' }
      });
      return;
    }
    
    // Deactivate existing rates for this combination
    await TariffRate.updateMany(
      {
        originCountry: originCountry.toUpperCase(),
        destinationCountry: destinationCountry.toUpperCase(),
        hsCode,
        isActive: true
      },
      { isActive: false }
    );
    
    // Create new tariff rate
    const newTariff = new TariffRate({
      originCountry: originCountry.toUpperCase(),
      destinationCountry: destinationCountry.toUpperCase(),
      hsCode,
      baseRate,
      specialRate: specialRate || 0,
      effectiveDate: effectiveDate || new Date(),
      source: 'MANUAL',
      notes
    });
    
    await newTariff.save();
    
    res.status(201).json({
      success: true,
      data: newTariff,
      message: 'Tariff rate updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating tariff rates:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error updating tariff rates' }
    });
  }
}; 