/// <reference types="vite/client" />

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface PricingRequest {
  _id?: string;
  origin: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  destination: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  cargo: {
    weight: number;
    volume: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    hsCode: string;
    productDescription: string;
    value: number;
    quantity: number;
  };
  transport: {
    type: 'road' | 'air' | 'sea' | 'rail' | 'multimodal';
    urgency: 'standard' | 'express' | 'urgent';
    specialRequirements: string[];
  };
  options: {
    insurance: boolean;
    customsClearance: boolean;
    doorToDoor: boolean;
    temperatureControlled: boolean;
  };
  status?: 'pending' | 'calculated' | 'expired' | 'cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingResponse {
  _id?: string;
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
  breakdown: {
    transport: number;
    duties: number;
    fees: number;
    insurance: number;
    total: number;
  };
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
  calculationDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingFilters {
  search?: string;
  status?: string;
  transportType?: string;
  originCountry?: string;
  destinationCountry?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PricingStats {
  overview: {
    totalRequests: number;
    pendingRequests: number;
    calculatedRequests: number;
    expiredRequests: number;
  };
  transportTypes: Array<{ type: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  averages: {
    avgCargoValue: number;
    avgWeight: number;
    avgVolume: number;
  };
}

class PricingService {
  // Get all pricing requests with optional filtering
  async getPricingRequests(filters: PricingFilters = {}): Promise<{
    data: PricingRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !(typeof value === 'string' && value === '') && value !== 0) {
          const stringValue = String(value);
          if (stringValue !== '') {
            params.append(key, stringValue);
          }
        }
      });

      const response = await axios.get(`${API_BASE_URL}/pricing/requests?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing requests:', error);
      throw new Error('Failed to fetch pricing requests');
    }
  }

  // Get a single pricing request by ID
  async getPricingRequestById(id: string): Promise<PricingRequest> {
    try {
      const response = await axios.get(`${API_BASE_URL}/pricing/requests/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pricing request:', error);
      throw new Error('Failed to fetch pricing request');
    }
  }

  // Create a new pricing request
  async createPricingRequest(requestData: Omit<PricingRequest, '_id' | 'createdAt' | 'updatedAt'>): Promise<PricingRequest> {
    try {
      const response = await axios.post(`${API_BASE_URL}/pricing/requests`, requestData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating pricing request:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to create pricing request');
    }
  }

  // Update an existing pricing request
  async updatePricingRequest(id: string, requestData: Partial<PricingRequest>): Promise<PricingRequest> {
    try {
      const response = await axios.put(`${API_BASE_URL}/pricing/requests/${id}`, requestData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating pricing request:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to update pricing request');
    }
  }

  // Delete a pricing request
  async deletePricingRequest(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/pricing/requests/${id}`);
    } catch (error) {
      console.error('Error deleting pricing request:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to delete pricing request');
    }
  }

  // Get pricing statistics
  async getPricingStats(): Promise<PricingStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/pricing/requests/stats`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pricing stats:', error);
      throw new Error('Failed to fetch pricing statistics');
    }
  }

  // Get all pricing responses
  async getPricingResponses(filters: { minCost?: number; maxCost?: number; page?: number; limit?: number } = {}): Promise<{
    data: PricingResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !(typeof value === 'string' && value === '') && value !== 0) {
          const stringValue = String(value);
          if (stringValue !== '') {
            params.append(key, stringValue);
          }
        }
      });

      const response = await axios.get(`${API_BASE_URL}/pricing/responses?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing responses:', error);
      throw new Error('Failed to fetch pricing responses');
    }
  }

  // Get a single pricing response by ID
  async getPricingResponseById(id: string): Promise<PricingResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/pricing/responses/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pricing response:', error);
      throw new Error('Failed to fetch pricing response');
    }
  }

  // Calculate price (legacy endpoint)
  async calculatePrice(requestData: Record<string, unknown>): Promise<{
    success: boolean;
    price: number;
    breakdown: {
      transport: number;
      duties: number;
      fees: number;
      insurance: number;
      total: number;
    };
    details: PricingResponse;
  }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/pricing/calculate`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to calculate price');
    }
  }

  // Get available transport types
  getAvailableTransportTypes(): string[] {
    return ['road', 'air', 'sea', 'rail', 'multimodal'];
  }

  // Get available urgency levels
  getAvailableUrgencyLevels(): string[] {
    return ['standard', 'express', 'urgent'];
  }

  // Get available countries
  getAvailableCountries(): string[] {
    return [
      'IT', 'US', 'DE', 'CN', 'FR', 'GB', 'JP', 'KR', 'CA', 'AU', 'BR', 'IN', 'MX', 'NL', 'ES', 'SE', 'CH', 'NO', 'DK', 'FI'
    ];
  }

  // Get available cities for a country
  getAvailableCities(country: string): string[] {
    const cityMap: { [key: string]: string[] } = {
      'IT': ['Milano', 'Roma', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Bari', 'Catania'],
      'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
      'DE': ['Berlino', 'Amburgo', 'Monaco', 'Colonia', 'Francoforte', 'Stoccarda', 'Düsseldorf', 'Dortmund', 'Essen', 'Lipsia'],
      'CN': ['Shanghai', 'Pechino', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Tianjin', 'Chongqing', 'Nanjing', 'Wuhan', 'Xi\'an'],
      'FR': ['Parigi', 'Marsiglia', 'Lione', 'Tolosa', 'Nizza', 'Nantes', 'Strasburgo', 'Montpellier', 'Bordeaux', 'Lille'],
      'GB': ['Londra', 'Birmingham', 'Leeds', 'Glasgow', 'Sheffield', 'Bradford', 'Edimburgo', 'Liverpool', 'Manchester', 'Bristol'],
      'JP': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama'],
      'KR': ['Seul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Buenos Aires', 'Seongnam'],
      'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
      'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
      'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
      'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur'],
      'MX': ['Città del Messico', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Ciudad Juárez', 'León', 'Zapopan', 'Nezahualcóyotl', 'Monterrey'],
      'NL': ['Amsterdam', 'Rotterdam', 'L\'Aia', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen'],
      'ES': ['Madrid', 'Barcellona', 'Valencia', 'Siviglia', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
      'SE': ['Stoccolma', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping'],
      'CH': ['Zurigo', 'Ginevra', 'Basilea', 'Losanna', 'Berna', 'Winterthur', 'Lucerna', 'San Gallo', 'Lugano', 'Biel'],
      'NO': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Tromsø', 'Sandnes', 'Bodø'],
      'DK': ['Copenaghen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle', 'Roskilde'],
      'FI': ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti', 'Kuopio', 'Pori']
    };
    
    return cityMap[country] || [];
  }

  // Validate pricing request data
  validatePricingRequest(data: Partial<PricingRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.origin?.country) errors.push('Origin country is required');
    if (!data.origin?.city) errors.push('Origin city is required');
    if (!data.destination?.country) errors.push('Destination country is required');
    if (!data.destination?.city) errors.push('Destination city is required');
    if (!data.cargo?.weight || data.cargo.weight <= 0) errors.push('Valid cargo weight is required');
    if (!data.cargo?.volume || data.cargo.volume <= 0) errors.push('Valid cargo volume is required');
    if (!data.cargo?.hsCode) errors.push('HS Code is required');
    if (!data.cargo?.productDescription) errors.push('Product description is required');
    if (!data.cargo?.value || data.cargo.value <= 0) errors.push('Valid cargo value is required');
    if (!data.transport?.type) errors.push('Transport type is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const pricingService = new PricingService();
export default pricingService; 