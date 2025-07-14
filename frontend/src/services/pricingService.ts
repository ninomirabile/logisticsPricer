/// <reference types="vite/client" />

import { PricingRequest, PricingResponse, HSCode, TariffRate, ShippingRoute, TransitTime, RequiredDocument, ShippingRestrictions } from '../types/pricing';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  return response.json();
}

export const pricingService = {
  // Calcolo prezzo principale
  async calculatePrice(request: PricingRequest): Promise<PricingResponse> {
    return apiCall<PricingResponse>('/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Ricerca codici HS
  async searchHSCodes(query: string): Promise<{ success: boolean; data: HSCode[]; count: number }> {
    return apiCall<{ success: boolean; data: HSCode[]; count: number }>(`/tariffs/hs-codes?query=${encodeURIComponent(query)}`);
  },

  // Calcolo dazi
  async calculateDuties(params: {
    originCountry: string;
    destinationCountry: string;
    hsCode: string;
    productValue: number;
    transportType?: string;
  }): Promise<{
    success: boolean;
    data: {
      baseDuty: number;
      specialTariffs: number;
      totalDuties: number;
      appliedRates: Array<{
        tariffId: string;
        rate: number;
        type: string;
        description: string;
      }>;
      calculationId: string;
    };
  }> {
    return apiCall('/tariffs/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Ottieni tariffe
  async getTariffRates(params: {
    originCountry: string;
    destinationCountry: string;
    hsCode: string;
  }): Promise<{ success: boolean; data: TariffRate[]; count: number }> {
    const queryParams = new URLSearchParams({
      originCountry: params.originCountry,
      destinationCountry: params.destinationCountry,
      hsCode: params.hsCode,
    });
    return apiCall<{ success: boolean; data: TariffRate[]; count: number }>(`/tariffs/rates?${queryParams}`);
  },

  // Ottieni rotte di spedizione
  async getShippingRoutes(params?: {
    originCountry?: string;
    destinationCountry?: string;
    transportType?: string;
  }): Promise<{ success: boolean; data: ShippingRoute[]; count: number }> {
    const queryParams = new URLSearchParams();
    if (params?.originCountry) queryParams.append('originCountry', params.originCountry);
    if (params?.destinationCountry) queryParams.append('destinationCountry', params.destinationCountry);
    if (params?.transportType) queryParams.append('transportType', params.transportType);
    
    const query = queryParams.toString();
    return apiCall<{ success: boolean; data: ShippingRoute[]; count: number }>(`/shipping/routes${query ? `?${query}` : ''}`);
  },

  // Calcola tempo di transito
  async calculateTransitTime(params: {
    origin: string;
    destination: string;
    transportType: string;
    productType?: string;
    urgency?: string;
  }): Promise<{ success: boolean; data: TransitTime }> {
    return apiCall<{ success: boolean; data: TransitTime }>('/shipping/calculate-transit', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Ottieni documenti richiesti
  async getRequiredDocuments(params: {
    originCountry: string;
    destinationCountry: string;
    productType?: string;
    transportType?: string;
    value?: number;
  }): Promise<{ success: boolean; data: RequiredDocument[]; count: number }> {
    const queryParams = new URLSearchParams({
      originCountry: params.originCountry,
      destinationCountry: params.destinationCountry,
    });
    if (params.productType) queryParams.append('productType', params.productType);
    if (params.transportType) queryParams.append('transportType', params.transportType);
    if (params.value) queryParams.append('value', params.value.toString());
    
    return apiCall<{ success: boolean; data: RequiredDocument[]; count: number }>(`/shipping/documents?${queryParams}`);
  },

  // Controlla restrizioni
  async checkRestrictions(params: {
    originCountry: string;
    destinationCountry: string;
    productType?: string;
    hsCode?: string;
  }): Promise<{ success: boolean; data: ShippingRestrictions }> {
    const queryParams = new URLSearchParams({
      originCountry: params.originCountry,
      destinationCountry: params.destinationCountry,
    });
    if (params.productType) queryParams.append('productType', params.productType);
    if (params.hsCode) queryParams.append('hsCode', params.hsCode);
    
    return apiCall<{ success: boolean; data: ShippingRestrictions }>(`/shipping/restrictions?${queryParams}`);
  },

  // Valida rotta
  async validateRoute(params: {
    originCountry: string;
    destinationCountry: string;
    transportType: string;
    productType?: string;
  }): Promise<{
    success: boolean;
    data: {
      valid: boolean;
      route?: ShippingRoute;
      restrictions?: string[];
      hasRestrictions?: boolean;
      estimatedTransitTime?: number;
      reason?: string;
      alternatives?: ShippingRoute[];
    };
  }> {
    return apiCall('/shipping/validate-route', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// Export delle funzioni principali per compatibilità
export const calculatePrice = pricingService.calculatePrice;
export const searchHSCodes = pricingService.searchHSCodes;
export const calculateDuties = pricingService.calculateDuties;
export const getTariffRates = pricingService.getTariffRates;
export const getShippingRoutes = pricingService.getShippingRoutes;
export const calculateTransitTime = pricingService.calculateTransitTime;
export const getRequiredDocuments = pricingService.getRequiredDocuments;
export const checkRestrictions = pricingService.checkRestrictions;
export const validateRoute = pricingService.validateRoute; 