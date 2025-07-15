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
    
    // Simplified query for testing
    const tariffs = await TariffRate.find({
      originCountry: (originCountry as string).toUpperCase(),
      destinationCountry: (destinationCountry as string).toUpperCase(),
      hsCode: hsCode as string
    });
    
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

// Get all tariffs with optional filtering and pagination
export const getAllTariffs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      search = '',
      originCountry,
      destinationCountry,
      source,
      isActive
    } = req.query;
    
    const query: Record<string, unknown> = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { originCountry: { $regex: search as string, $options: 'i' } },
        { destinationCountry: { $regex: search as string, $options: 'i' } },
        { hsCode: { $regex: search as string, $options: 'i' } }
      ];
    }
    
    if (originCountry) query.originCountry = originCountry;
    if (destinationCountry) query.destinationCountry = destinationCountry;
    if (source) query.source = source;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const tariffs = await TariffRate.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await TariffRate.countDocuments(query);
    
    res.json({
      success: true,
      data: tariffs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching tariffs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tariffs' }
    });
  }
};

// Get a single tariff by ID
export const getTariffById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const tariff = await TariffRate.findById(id);
    
    if (!tariff) {
      res.status(404).json({
        success: false,
        error: { message: 'Tariff not found' }
      });
      return;
    }

    res.json({
      success: true,
      data: tariff
    });
  } catch (error) {
    console.error('Error fetching tariff:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tariff' }
    });
  }
};

// Create a new tariff
export const createTariff = async (req: Request, res: Response): Promise<void> => {
  try {
    const tariffData = req.body;
    
    // Validate required fields
    if (!tariffData.originCountry || !tariffData.destinationCountry || !tariffData.hsCode || tariffData.baseRate === undefined) {
      res.status(400).json({
        success: false,
        error: { message: 'Origin country, destination country, HS code, and base rate are required' }
      });
      return;
    }

    // Check if tariff already exists for this combination
    const existingTariff = await TariffRate.findOne({ 
      originCountry: tariffData.originCountry,
      destinationCountry: tariffData.destinationCountry,
      hsCode: tariffData.hsCode,
      isActive: true 
    });

    if (existingTariff) {
      res.status(409).json({
        success: false,
        error: { message: 'A tariff already exists for this combination' }
      });
      return;
    }

    const newTariff = new TariffRate(tariffData);
    const savedTariff = await newTariff.save();

    res.status(201).json({
      success: true,
      data: savedTariff,
      message: 'Tariff created successfully'
    });
  } catch (error) {
    console.error('Error creating tariff:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create tariff' }
    });
  }
};

// Update an existing tariff
export const updateTariff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const tariff = await TariffRate.findById(id);
    
    if (!tariff) {
      res.status(404).json({
        success: false,
        error: { message: 'Tariff not found' }
      });
      return;
    }

    // Update the tariff
    Object.assign(tariff, updateData);
    const updatedTariff = await tariff.save();

    res.json({
      success: true,
      data: updatedTariff,
      message: 'Tariff updated successfully'
    });
  } catch (error) {
    console.error('Error updating tariff:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update tariff' }
    });
  }
};

// Delete a tariff
export const deleteTariff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const tariff = await TariffRate.findById(id);
    
    if (!tariff) {
      res.status(404).json({
        success: false,
        error: { message: 'Tariff not found' }
      });
      return;
    }

    await TariffRate.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Tariff deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tariff:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete tariff' }
    });
  }
};

// Get tariff statistics
export const getTariffStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await TariffRate.aggregate([
      {
        $group: {
          _id: null,
          totalTariffs: { $sum: 1 },
          activeTariffs: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);

    const countryStats = await TariffRate.aggregate([
      {
        $group: {
          _id: '$originCountry',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const sourceStats = await TariffRate.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const topHSCodes = await TariffRate.aggregate([
      {
        $group: {
          _id: '$hsCode',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalTariffs: 0,
          activeTariffs: 0
        },
        countries: countryStats.map(item => ({ country: item._id, count: item.count })),
        sources: sourceStats.map(item => ({ source: item._id, count: item.count })),
        topHSCodes: topHSCodes.map(item => ({ hsCode: item._id, count: item.count }))
      }
    });
  } catch (error) {
    console.error('Error fetching tariff stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tariff statistics' }
    });
  }
};

// Search tariffs by HS code
export const searchTariffsByHSCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hsCode } = req.params;
    
    const tariffs = await TariffRate.find({
      hsCode: { $regex: hsCode, $options: 'i' },
      isActive: true,
      effectiveDate: { $lte: new Date() },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } }
      ]
    }).sort({ effectiveDate: -1 });
    
    res.json({
      success: true,
      data: tariffs
    });
  } catch (error) {
    console.error('Error searching tariffs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to search tariffs' }
    });
  }
}; 