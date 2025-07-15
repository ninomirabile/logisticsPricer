import { Request, Response } from 'express';
import PricingRequest from '../models/PricingRequest';
import PricingResponse from '../models/PricingResponse';
import DutyCalculation from '../models/DutyCalculation';
import TariffRate from '../models/TariffRate';

// Algoritmo di esempio per il calcolo del prezzo base
function calculateBaseTransportCost(params: {
  weight: number;
  volume: number;
  transportType: string;
  urgency?: string;
}): number {
  let base = 50;
  const { weight, volume, transportType, urgency = 'standard' } = params;
  
  // Apply transport type factors
  if (transportType === 'road') base += 0.5 * weight + 0.2 * volume;
  else if (transportType === 'air') base += 1.2 * weight + 0.5 * volume;
  else if (transportType === 'sea') base += 0.3 * weight + 0.1 * volume;
  else base += 0.7 * weight + 0.3 * volume;
  
  // Apply urgency multiplier
  const urgencyMultiplier = urgency === 'express' ? 1.5 : urgency === 'urgent' ? 2.0 : 1.0;
  
  return Math.round((base * urgencyMultiplier) * 100) / 100;
}

// Calcolo dazi e tariffe
async function calculateDutiesAndTariffs(params: {
  originCountry: string;
  hsCode: string;
  productValue: number;
}): Promise<{
  baseDuty: number;
  specialTariffs: number;
  totalDuties: number;
  appliedRates: Array<{
    tariffId: string;
    rate: number;
    type: string;
    description: string;
  }>;
}> {
  const { originCountry, hsCode, productValue } = params;
  
  // Get applicable tariff rates
  const tariffRates = await TariffRate.find({
    originCountry: originCountry.toUpperCase(),
    // destinationCountry rimosso perché non più usato
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
    type: string;
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
  
  return {
    baseDuty: Math.round(baseDuty * 100) / 100,
    specialTariffs: Math.round(specialTariffs * 100) / 100,
    totalDuties: Math.round((baseDuty + specialTariffs) * 100) / 100,
    appliedRates
  };
}

// Calcolo costi aggiuntivi
function calculateAdditionalCosts(params: {
  transportType: string;
  productValue: number;
  options?: {
    insurance?: boolean;
    customsClearance?: boolean;
  };
}): {
  customsClearance: number;
  documentation: number;
  insurance: number;
  handling: number;
  storage: number;
} {
  const { transportType, productValue, options = {} } = params;
  
  const customsClearance = options.customsClearance ? 150 : 0;
  const documentation = 50;
  const insurance = options.insurance ? (productValue * 0.02) : 0; // 2% of product value
  const handling = transportType === 'sea' ? 200 : transportType === 'air' ? 100 : 50;
  const storage = 0; // Could be calculated based on volume and time
  
  return {
    customsClearance,
    documentation,
    insurance: Math.round(insurance * 100) / 100,
    handling,
    storage
  };
}

export const calculatePrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestData = req.body;
    
    // Handle both old and new request formats
    let pricingRequest: any;
    
    if (requestData.cargo && requestData.origin && requestData.destination) {
      // New format
      pricingRequest = new PricingRequest(requestData);
    } else {
      // Old format - convert to new format
      pricingRequest = new PricingRequest({
        origin: {
          country: requestData.origin,
          city: requestData.origin
        },
        destination: {
          country: requestData.destination,
          city: requestData.destination
        },
        cargo: {
          weight: requestData.weight,
          volume: requestData.volume,
          dimensions: {
            length: 1,
            width: 1,
            height: requestData.volume
          },
          hsCode: '9999.99.99', // Default HS code
          productDescription: 'General cargo',
          value: requestData.weight * 10, // Estimate value
          quantity: 1
        },
        transport: {
          type: requestData.transportType,
          urgency: 'standard',
          specialRequirements: []
        },
        options: {
          insurance: false,
          customsClearance: false,
          doorToDoor: false,
          temperatureControlled: false
        }
      });
    }
    
    await pricingRequest.save();
    
    // Calculate base transport cost
    const baseTransportCost = calculateBaseTransportCost({
      weight: pricingRequest.cargo.weight,
      volume: pricingRequest.cargo.volume,
      transportType: pricingRequest.transport.type,
      urgency: pricingRequest.transport.urgency
    });
    
    // Calculate duties and tariffs
    const dutiesAndTariffs = await calculateDutiesAndTariffs({
      originCountry: pricingRequest.origin.country,
      hsCode: pricingRequest.cargo.hsCode,
      productValue: pricingRequest.cargo.value
    });
    
    // Calculate additional costs
    const additionalCosts = calculateAdditionalCosts({
      transportType: pricingRequest.transport.type,
      productValue: pricingRequest.cargo.value,
      options: pricingRequest.options
    });
    
    // Calculate total cost
    const totalCost = baseTransportCost + dutiesAndTariffs.totalDuties + 
      Object.values(additionalCosts).reduce((sum, cost) => sum + cost, 0);
    
    // Create pricing response
    const pricingResponse = new PricingResponse({
      requestId: String(pricingRequest._id),
      baseTransportCost,
      dutiesAndTariffs,
      additionalCosts,
      totalCost: Math.round(totalCost * 100) / 100,
      breakdown: {
        transport: baseTransportCost,
        duties: dutiesAndTariffs.totalDuties,
        fees: additionalCosts.customsClearance + additionalCosts.documentation,
        insurance: additionalCosts.insurance,
        total: Math.round(totalCost * 100) / 100
      },
      transitTime: {
        estimated: 7, // Default estimate
        confidence: 0.8,
        factors: ['Standard transit time']
      },
      validity: {
        from: new Date(),
        to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      notes: ['Price calculated successfully']
    });
    
    await pricingResponse.save();
    
    // Save duty calculation for tracking
    const dutyCalculation = new DutyCalculation({
      requestId: String(pricingRequest._id),
      originCountry: pricingRequest.origin.country,
      destinationCountry: pricingRequest.destination.country,
      hsCode: pricingRequest.cargo.hsCode,
      productValue: pricingRequest.cargo.value,
      baseDuty: dutiesAndTariffs.baseDuty,
      specialDuty: dutiesAndTariffs.specialTariffs,
      totalDuty: dutiesAndTariffs.totalDuties,
      appliedRates: dutiesAndTariffs.appliedRates.map(rate => ({
        tariffId: rate.tariffId,
        rate: rate.rate,
        type: rate.type as 'base' | 'special',
        description: rate.description
      }))
    });
    
    await dutyCalculation.save();
    
    // Update request status
    pricingRequest.status = 'calculated';
    await pricingRequest.save();
    
    // Return response (backward compatible)
    res.status(200).json({
      success: true,
      price: Math.round(totalCost * 100) / 100,
      breakdown: {
        transport: baseTransportCost,
        duties: dutiesAndTariffs.totalDuties,
        fees: additionalCosts.customsClearance + additionalCosts.documentation,
        insurance: additionalCosts.insurance,
        total: Math.round(totalCost * 100) / 100
      },
      details: pricingResponse
    });
    
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Errore nel calcolo del prezzo', 
        details: error instanceof Error ? error.message : 'Unknown error'
      } 
    });
  }
}; 

// Get all pricing requests with optional filtering and pagination
export const getAllPricingRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      search = '',
      status,
      transportType,
      originCountry,
      destinationCountry
    } = req.query;
    
    const query: Record<string, unknown> = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { 'origin.city': { $regex: search as string, $options: 'i' } },
        { 'destination.city': { $regex: search as string, $options: 'i' } },
        { 'cargo.productDescription': { $regex: search as string, $options: 'i' } },
        { 'cargo.hsCode': { $regex: search as string, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (transportType) query['transport.type'] = transportType;
    if (originCountry) query['origin.country'] = originCountry;
    if (destinationCountry) query['destination.country'] = destinationCountry;
    
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const requests = await PricingRequest.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await PricingRequest.countDocuments(query);
    
    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching pricing requests:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch pricing requests' }
    });
  }
};

// Get a single pricing request by ID
export const getPricingRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const request = await PricingRequest.findById(id);
    
    if (!request) {
      res.status(404).json({
        success: false,
        error: { message: 'Pricing request not found' }
      });
      return;
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching pricing request:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch pricing request' }
    });
  }
};

// Create a new pricing request
export const createPricingRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestData = req.body;
    
    // Validate required fields
    if (!requestData.origin || !requestData.destination || !requestData.cargo || !requestData.transport) {
      res.status(400).json({
        success: false,
        error: { message: 'Origin, destination, cargo, and transport details are required' }
      });
      return;
    }

    const newRequest = new PricingRequest(requestData);
    const savedRequest = await newRequest.save();

    res.status(201).json({
      success: true,
      data: savedRequest,
      message: 'Pricing request created successfully'
    });
  } catch (error) {
    console.error('Error creating pricing request:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create pricing request' }
    });
  }
};

// Update an existing pricing request
export const updatePricingRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const request = await PricingRequest.findById(id);
    
    if (!request) {
      res.status(404).json({
        success: false,
        error: { message: 'Pricing request not found' }
      });
      return;
    }

    // Update the request
    Object.assign(request, updateData);
    const updatedRequest = await request.save();

    res.json({
      success: true,
      data: updatedRequest,
      message: 'Pricing request updated successfully'
    });
  } catch (error) {
    console.error('Error updating pricing request:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update pricing request' }
    });
  }
};

// Delete a pricing request
export const deletePricingRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const request = await PricingRequest.findById(id);
    
    if (!request) {
      res.status(404).json({
        success: false,
        error: { message: 'Pricing request not found' }
      });
      return;
    }

    await PricingRequest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Pricing request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pricing request:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete pricing request' }
    });
  }
};

// Get pricing statistics
export const getPricingStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await PricingRequest.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          calculatedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'calculated'] }, 1, 0] }
          },
          expiredRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          }
        }
      }
    ]);

    const transportTypeStats = await PricingRequest.aggregate([
      {
        $group: {
          _id: '$transport.type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const countryStats = await PricingRequest.aggregate([
      {
        $group: {
          _id: '$origin.country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const avgValues = await PricingRequest.aggregate([
      {
        $group: {
          _id: null,
          avgCargoValue: { $avg: '$cargo.value' },
          avgWeight: { $avg: '$cargo.weight' },
          avgVolume: { $avg: '$cargo.volume' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalRequests: 0,
          pendingRequests: 0,
          calculatedRequests: 0,
          expiredRequests: 0
        },
        transportTypes: transportTypeStats.map(item => ({ type: item._id, count: item.count })),
        topCountries: countryStats.map(item => ({ country: item._id, count: item.count })),
        averages: avgValues[0] || {
          avgCargoValue: 0,
          avgWeight: 0,
          avgVolume: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pricing stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch pricing statistics' }
    });
  }
};

// Get all pricing responses
export const getAllPricingResponses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'calculationDate', 
      sortOrder = 'desc',
      minCost,
      maxCost
    } = req.query;
    
    const query: Record<string, unknown> = {};
    
    if (minCost || maxCost) {
      const totalCost: Record<string, number> = {};
      if (minCost) totalCost["$gte"] = Number(minCost);
      if (maxCost) totalCost["$lte"] = Number(maxCost);
      query.totalCost = totalCost;
    }
    
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const responses = await PricingResponse.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await PricingResponse.countDocuments(query);
    
    res.json({
      success: true,
      data: responses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching pricing responses:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch pricing responses' }
    });
  }
};

// Get a single pricing response by ID
export const getPricingResponseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const response = await PricingResponse.findById(id);
    
    if (!response) {
      res.status(404).json({
        success: false,
        error: { message: 'Pricing response not found' }
      });
      return;
    }

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching pricing response:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch pricing response' }
    });
  }
}; 