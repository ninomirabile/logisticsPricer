import mongoose, { Document, Schema } from 'mongoose';

export interface ITariffRate extends Document {
  originCountry: string;
  destinationCountry: string;
  hsCode: string;
  baseRate: number; // percentage (e.g., 5.5 for 5.5%)
  specialRate?: number; // for special tariffs like anti-dumping
  effectiveDate: Date;
  expiryDate?: Date;
  source: string; // source of the tariff data
  lastUpdated: Date;
  isActive: boolean;
  notes?: string;
}

const TariffRateSchema = new Schema<ITariffRate>({
  originCountry: { 
    type: String, 
    required: true,
    uppercase: true,
    trim: true
  },
  destinationCountry: { 
    type: String, 
    required: true,
    uppercase: true,
    trim: true
  },
  hsCode: { 
    type: String, 
    required: true,
    trim: true
  },
  baseRate: { 
    type: Number, 
    required: true, 
    min: 0,
    max: 100 // percentage
  },
  specialRate: { 
    type: Number, 
    required: false,
    min: 0,
    max: 100
  },
  effectiveDate: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  expiryDate: { 
    type: Date, 
    required: false
  },
  source: { 
    type: String, 
    required: true,
    enum: ['WTO', 'CUSTOMS_API', 'MANUAL', 'TRADE_AGREEMENT']
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now
  },
  isActive: { 
    type: Boolean, 
    default: true
  },
  notes: { 
    type: String 
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
TariffRateSchema.index({ 
  originCountry: 1, 
  destinationCountry: 1, 
  hsCode: 1, 
  effectiveDate: -1 
});

TariffRateSchema.index({ 
  isActive: 1, 
  effectiveDate: -1 
});

// Compound index for tariff lookups
TariffRateSchema.index({ 
  originCountry: 1, 
  destinationCountry: 1, 
  hsCode: 1, 
  isActive: 1 
});

export default mongoose.model<ITariffRate>('TariffRate', TariffRateSchema); 