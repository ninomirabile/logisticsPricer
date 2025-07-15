import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export interface USDuty {
  _id?: string;
  hsCode: string;
  productDescription: string;
  baseRate: number;
  section301Rate?: number;
  section232Rate?: number;
  section201Rate?: number;
  effectiveDate: string;
  expiryDate?: string;
  source: string;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface USDutyResponse {
  success: boolean;
  data: USDuty[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getUSDuties = async (params?: Record<string, string | number | boolean>) => {
  const res = await axios.get<USDutyResponse>(`${API_BASE}/usa-duties`, { params });
  return res.data;
};

export const getUSDutyById = async (id: string) => {
  const res = await axios.get<{ success: boolean; data: USDuty }>(`${API_BASE}/usa-duties/${id}`);
  return res.data.data;
};

export const createUSDuty = async (duty: Partial<USDuty>) => {
  const res = await axios.post<{ success: boolean; data: USDuty }>(`${API_BASE}/usa-duties`, duty);
  return res.data.data;
};

export const updateUSDuty = async (id: string, duty: Partial<USDuty>) => {
  const res = await axios.put<{ success: boolean; data: USDuty }>(`${API_BASE}/usa-duties/${id}`, duty);
  return res.data.data;
};

export const deleteUSDuty = async (id: string) => {
  const res = await axios.delete<{ success: boolean; message: string }>(`${API_BASE}/usa-duties/${id}`);
  return res.data.success;
}; 