import mongoose, { Document, Schema } from 'mongoose';

export interface IDutyCalculation extends Document {
  requestId: string;
  originCountry: string;
  destinationCountry: string;
  hsCode: string;
  productValue: number;
  baseDuty: number;
  specialDuty?: number;
  totalDuty: number;
  calculationDate: Date;
  appliedRates: Array<{
    tariffId: string;
    rate: number;
    type: 'base' | 'special';
    description: string;
  }>;
  notes?: string;
}

const DutyCalculationSchema = new Schema<IDutyCalculation>({
  requestId: { 
    type: String, 
    required: true,
    ref: 'PricingRequest'
  },
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
  productValue: { 
    type: Number, 
    required: true,
    min: 0
  },
  baseDuty: { 
    type: Number, 
    required: true,
    min: 0
  },
  specialDuty: { 
    type: Number, 
    required: false,
    min: 0
  },
  totalDuty: { 
    type: Number, 
    required: true,
    min: 0
  },
  calculationDate: { 
    type: Date, 
    default: Date.now
  },
  appliedRates: [{
    tariffId: { 
      type: String, 
      required: true,
      ref: 'TariffRate'
    },
    rate: { 
      type: Number, 
      required: true,
      min: 0
    },
    type: { 
      type: String, 
      required: true,
      enum: ['base', 'special']
    },
    description: { 
      type: String, 
      required: true
    }
  }],
  notes: { 
    type: String 
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
DutyCalculationSchema.index({ 
  requestId: 1 
});

DutyCalculationSchema.index({ 
  originCountry: 1, 
  destinationCountry: 1, 
  calculationDate: -1 
});

DutyCalculationSchema.index({ 
  hsCode: 1, 
  calculationDate: -1 
});

export default mongoose.model<IDutyCalculation>('DutyCalculation', DutyCalculationSchema); 