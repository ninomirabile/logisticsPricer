export interface PricingRequest {
  origin: string;
  destination: string;
  weight: number;
  volume: number;
  transportType: 'road' | 'air' | 'sea' | 'rail';
  hsCode?: string;
  productValue?: number;
  urgency?: 'standard' | 'express' | 'urgent';
  options?: {
    insurance?: boolean;
    customsClearance?: boolean;
    doorToDoor?: boolean;
    temperatureControlled?: boolean;
  };
}

export interface PricingResponse {
  success: boolean;
  price: number;
  breakdown: {
    transport: number;
    duties: number;
    fees: number;
    insurance: number;
    total: number;
  };
  details: {
    requestId: string;
    baseTransportCost: number;
    dutiesAndTariffs: {
      baseDuty: number;
      specialTariffs: number;
      totalDuties: number;
      appliedRates: Array<{
        tariffId: string;
        rate: number;
        type: string;
        description: string;
      }>;
    };
    additionalCosts: {
      customsClearance: number;
      documentation: number;
      insurance: number;
      handling: number;
      storage: number;
    };
    totalCost: number;
    transitTime: {
      estimated: number;
      confidence: number;
      factors: string[];
    };
    validity: {
      from: string;
      to: string;
    };
    notes: string[];
  };
}

export interface TariffRate {
  _id: string;
  originCountry: string;
  destinationCountry: string;
  hsCode: string;
  baseRate: number;
  specialRate?: number;
  effectiveDate: string;
  expiryDate?: string;
  source: string;
  notes?: string;
  isActive: boolean;
}

export interface HSCode {
  code: string;
  description: string;
  category: string;
}

export interface ShippingRoute {
  id: string;
  originCountry: string;
  destinationCountry: string;
  transportType: string;
  baseTransitTime: number;
  customsDelay: number;
  portCongestion: number;
  restrictions: string[];
}

export interface TransitTime {
  baseTime: number;
  customsTime: number;
  congestionTime: number;
  totalTime: number;
  confidence: number;
  factors: string[];
  routeId: string;
}

export interface RequiredDocument {
  type: string;
  required: boolean;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface ShippingRestrictions {
  restrictions: string[];
  count: number;
  severity: 'low' | 'medium' | 'high';
} 