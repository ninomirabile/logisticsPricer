/// <reference types="vite/client" />

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface ShippingRoute {
  _id?: string;
  routeId: string;
  originCountry: string;
  destinationCountry: string;
  transportType: 'road' | 'air' | 'sea' | 'rail' | 'multimodal';
  baseTransitTime: number; // in days
  customsDelay: number; // in days
  portCongestion: number; // in days
  restrictions: string[];
  requirements: {
    documents: Array<{
      type: string;
      required: boolean;
      priority: 'high' | 'medium' | 'low';
      description: string;
    }>;
    specialHandling: string[];
    certifications: string[];
  };
  costs: {
    baseCost: number;
    customsFees: number;
    portFees: number;
    additionalFees: number;
  };
  isActive: boolean;
  effectiveDate?: string;
  expiryDate?: string;
  notes?: string;
  source: string;
  createdAt?: string;
  updatedAt?: string;
  totalTransitTime?: number; // virtual field
  totalCost?: number; // virtual field
}

export interface ShippingRouteFilters {
  search?: string;
  originCountry?: string;
  destinationCountry?: string;
  transportType?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ShippingRouteStats {
  overview: {
    totalRoutes: number;
    activeRoutes: number;
    avgTransitTime: number;
    avgCustomsDelay: number;
  };
  transportTypes: Array<{ type: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
}

export interface TransitTimeCalculation {
  origin: string;
  destination: string;
  transportType: string;
  urgency?: 'standard' | 'express' | 'urgent';
}

export interface TransitTimeResult {
  baseTime: number;
  customsTime: number;
  congestionTime: number;
  totalTime: number;
  confidence: number;
  factors: string[];
  routeId: string;
}

export interface DocumentRequirement {
  type: string;
  required: boolean;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface RouteValidation {
  originCountry: string;
  destinationCountry: string;
  transportType: string;
}

export interface RouteValidationResult {
  valid: boolean;
  route?: ShippingRoute;
  restrictions: string[];
  hasRestrictions: boolean;
  estimatedTransitTime: number;
  reason?: string;
  alternatives?: ShippingRoute[];
}

class ShippingService {
  // Get all shipping routes with optional filtering
  async getShippingRoutes(filters: ShippingRouteFilters = {}): Promise<{
    data: ShippingRoute[];
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
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${API_BASE_URL}/shipping/routes?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shipping routes:', error);
      throw new Error('Failed to fetch shipping routes');
    }
  }

  // Get a single shipping route by ID
  async getShippingRouteById(id: string): Promise<ShippingRoute> {
    try {
      const response = await axios.get(`${API_BASE_URL}/shipping/routes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching shipping route:', error);
      throw new Error('Failed to fetch shipping route');
    }
  }

  // Create a new shipping route
  async createShippingRoute(routeData: Omit<ShippingRoute, '_id' | 'createdAt' | 'updatedAt'>): Promise<ShippingRoute> {
    try {
      const response = await axios.post(`${API_BASE_URL}/shipping/routes`, routeData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating shipping route:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to create shipping route');
    }
  }

  // Update an existing shipping route
  async updateShippingRoute(id: string, routeData: Partial<ShippingRoute>): Promise<ShippingRoute> {
    try {
      const response = await axios.put(`${API_BASE_URL}/shipping/routes/${id}`, routeData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating shipping route:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to update shipping route');
    }
  }

  // Delete a shipping route
  async deleteShippingRoute(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/shipping/routes/${id}`);
    } catch (error) {
      console.error('Error deleting shipping route:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to delete shipping route');
    }
  }

  // Get shipping route statistics
  async getShippingRouteStats(): Promise<ShippingRouteStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/shipping/routes/stats`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching shipping route stats:', error);
      throw new Error('Failed to fetch shipping route statistics');
    }
  }

  // Calculate transit time
  async calculateTransitTime(calculation: TransitTimeCalculation): Promise<TransitTimeResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/shipping/calculate-transit`, calculation);
      return response.data.data;
    } catch (error) {
      console.error('Error calculating transit time:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to calculate transit time');
    }
  }

  // Get required documents
  async getRequiredDocuments(params: {
    originCountry: string;
    destinationCountry: string;
    transportType?: string;
    value?: number;
  }): Promise<DocumentRequirement[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(`${API_BASE_URL}/shipping/documents?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching required documents:', error);
      throw new Error('Failed to fetch required documents');
    }
  }

  // Validate shipping route
  async validateRoute(validation: RouteValidation): Promise<RouteValidationResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/shipping/validate-route`, validation);
      return response.data.data;
    } catch (error) {
      console.error('Error validating route:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to validate route');
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

  // Validate shipping route data
  validateShippingRoute(data: Partial<ShippingRoute>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.routeId) errors.push('Route ID is required');
    if (!data.originCountry) errors.push('Origin country is required');
    if (!data.destinationCountry) errors.push('Destination country is required');
    if (!data.transportType) errors.push('Transport type is required');
    if (!data.baseTransitTime || data.baseTransitTime <= 0) errors.push('Valid base transit time is required');
    if (!data.source) errors.push('Source is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const shippingService = new ShippingService();
export default shippingService; 