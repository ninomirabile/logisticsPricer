import { Request, Response } from 'express';
import { USDuty } from '../models/USDuty';

// Get all USA duties with optional filtering and pagination
export const getAllUSDuties = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      search = '',
      isActive,
      source
    } = req.query;
    
    const query: Record<string, unknown> = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { hsCode: { $regex: search as string, $options: 'i' } },
        { productDescription: { $regex: search as string, $options: 'i' } },
        { notes: { $regex: search as string, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (source) query.source = source;
    
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const duties = await USDuty.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await USDuty.countDocuments(query);
    
    return res.json({
      success: true,
      data: duties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching USA duties:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch USA duties' }
    });
  }
};

// Get a single USA duty by ID
export const getUSDutyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const duty = await USDuty.findById(id);
    
    if (!duty) {
      return res.status(404).json({
        success: false,
        error: { message: 'USA duty not found' }
      });
    }

    return res.json({
      success: true,
      data: duty
    });
  } catch (error) {
    console.error('Error fetching USA duty:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch USA duty' }
    });
  }
};

// Create a new USA duty
export const createUSDuty = async (req: Request, res: Response) => {
  try {
    const dutyData = req.body;
    
    // Validate required fields
    if (!dutyData.hsCode || !dutyData.productDescription || dutyData.baseRate === undefined) {
      return res.status(400).json({
        success: false,
        error: { message: 'HS Code, product description, and base rate are required' }
      });
    }

    // Check if duty already exists for this HS code
    const existingDuty = await USDuty.findOne({ 
      hsCode: dutyData.hsCode,
      isActive: true 
    });

    if (existingDuty) {
      return res.status(409).json({
        success: false,
        error: { message: 'A duty already exists for this HS code' }
      });
    }

    const newDuty = new USDuty(dutyData);
    const savedDuty = await newDuty.save();

    return res.status(201).json({
      success: true,
      data: savedDuty,
      message: 'USA duty created successfully'
    });
  } catch (error) {
    console.error('Error creating USA duty:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to create USA duty' }
    });
  }
};

// Update an existing USA duty
export const updateUSDuty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const duty = await USDuty.findById(id);
    
    if (!duty) {
      return res.status(404).json({
        success: false,
        error: { message: 'USA duty not found' }
      });
    }

    // Update the duty
    Object.assign(duty, updateData);
    const updatedDuty = await duty.save();

    return res.json({
      success: true,
      data: updatedDuty,
      message: 'USA duty updated successfully'
    });
  } catch (error) {
    console.error('Error updating USA duty:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update USA duty' }
    });
  }
};

// Delete a USA duty
export const deleteUSDuty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const duty = await USDuty.findById(id);
    
    if (!duty) {
      return res.status(404).json({
        success: false,
        error: { message: 'USA duty not found' }
      });
    }

    await USDuty.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'USA duty deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting USA duty:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to delete USA duty' }
    });
  }
};

// Get duty statistics
export const getUSDutyStats = async (req: Request, res: Response) => {
  try {
    const stats = await USDuty.aggregate([
      {
        $group: {
          _id: null,
          totalDuties: { $sum: 1 },
          activeDuties: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          section301Count: {
            $sum: { $cond: [{ $ne: ['$section301Rate', null] }, 1, 0] }
          },
          section232Count: {
            $sum: { $cond: [{ $ne: ['$section232Rate', null] }, 1, 0] }
          },
          section201Count: {
            $sum: { $cond: [{ $ne: ['$section201Rate', null] }, 1, 0] }
          }
        }
      }
    ]);

    const sourceStats = await USDuty.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalDuties: 0,
          activeDuties: 0,
          section301Count: 0,
          section232Count: 0,
          section201Count: 0
        },
        sources: sourceStats
      }
    });
  } catch (error) {
    console.error('Error fetching USA duty stats:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch USA duty statistics' }
    });
  }
};

// Search duties by HS code
export const searchUSDutiesByHSCode = async (req: Request, res: Response) => {
  try {
    const { hsCode } = req.params;
    
    // Use direct query instead of static method
    const duties = await USDuty.find({
      hsCode: { $regex: hsCode, $options: 'i' },
      isActive: true,
      effectiveDate: { $lte: new Date() },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } }
      ]
    }).sort({ effectiveDate: -1 });
    
    return res.json({
      success: true,
      data: duties
    });
  } catch (error) {
    console.error('Error searching USA duties:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to search USA duties' }
    });
  }
}; 