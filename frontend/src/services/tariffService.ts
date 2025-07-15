import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

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
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TariffFilters {
  search?: string;
  originCountry?: string;
  destinationCountry?: string;
  source?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TariffStats {
  totalTariffs: number;
  activeTariffs: number;
  countries: Array<{ country: string; count: number }>;
  sources: Array<{ source: string; count: number }>;
  topHSCodes: Array<{ hsCode: string; count: number }>;
}

class TariffService {
  // Get all tariffs with optional filtering
  async getTariffs(filters: TariffFilters = {}): Promise<{
    data: TariffRate[];
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

      const response = await axios.get(`${API_BASE_URL}/tariffs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tariffs:', error);
      throw new Error('Failed to fetch tariffs');
    }
  }

  // Get a single tariff by ID
  async getTariffById(id: string): Promise<TariffRate> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tariffs/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tariff:', error);
      throw new Error('Failed to fetch tariff');
    }
  }

  // Create a new tariff
  async createTariff(tariffData: Omit<TariffRate, '_id' | 'createdAt' | 'updatedAt'>): Promise<TariffRate> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tariffs`, tariffData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating tariff:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to create tariff');
    }
  }

  // Update an existing tariff
  async updateTariff(id: string, tariffData: Partial<TariffRate>): Promise<TariffRate> {
    try {
      const response = await axios.put(`${API_BASE_URL}/tariffs/${id}`, tariffData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating tariff:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to update tariff');
    }
  }

  // Delete a tariff
  async deleteTariff(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/tariffs/${id}`);
    } catch (error) {
      console.error('Error deleting tariff:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to delete tariff');
    }
  }

  // Get tariff statistics
  async getTariffStats(): Promise<TariffStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tariffs/stats`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tariff stats:', error);
      throw new Error('Failed to fetch tariff statistics');
    }
  }

  // Search tariffs by HS code
  async searchByHSCode(hsCode: string): Promise<TariffRate[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tariffs/search/${hsCode}`);
      return response.data.data;
    } catch (error) {
      console.error('Error searching tariffs:', error);
      throw new Error('Failed to search tariffs');
    }
  }

  // Bulk import tariffs
  async bulkImport(tariffs: Omit<TariffRate, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tariffs/bulk-import`, { tariffs });
      return response.data.data;
    } catch (error) {
      console.error('Error bulk importing tariffs:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Failed to bulk import tariffs');
    }
  }

  // Export tariffs to CSV
  async exportToCSV(filters: TariffFilters = {}): Promise<globalThis.Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', 'csv');
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${API_BASE_URL}/tariffs/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting tariffs:', error);
      throw new Error('Failed to export tariffs');
    }
  }

  // Validate HS code format
  validateHSCode(hsCode: string): boolean {
    // Basic HS code validation (6-10 digits with optional dots)
    const hsCodeRegex = /^\d{4,6}(\.\d{2,4})?$/;
    return hsCodeRegex.test(hsCode);
  }

  // Get available countries
  getAvailableCountries(): string[] {
    return [
      'IT', 'US', 'DE', 'CN', 'FR', 'GB', 'JP', 'KR', 'CA', 'AU', 'BR', 'IN', 'MX', 'NL', 'ES', 'SE', 'CH', 'NO', 'DK', 'FI'
    ];
  }

  // Get available sources
  getAvailableSources(): string[] {
    return [
      'WTO', 'CUSTOMS_API', 'MANUAL', 'TRADE_AGREEMENT', 'GSP', 'FTA', 'PREFERENTIAL', 'ANTI_DUMPING', 'COUNTERVAILING'
    ];
  }
}

export const tariffService = new TariffService();
export default tariffService; 