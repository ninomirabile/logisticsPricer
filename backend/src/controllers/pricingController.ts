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