import mongoose, { Document, Schema } from 'mongoose';

export interface IPricingResponse extends Document {
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
    estimated: number; // days
    confidence: number; // 0-1
    factors: string[];
  };
  validity: {
    from: Date;
    to: Date;
  };
  notes: string[];
  calculationDate: Date;
}

const PricingResponseSchema = new Schema<IPricingResponse>({
  requestId: { 
    type: String, 
    required: true,
    ref: 'PricingRequest'
  },
  baseTransportCost: { 
    type: Number, 
    required: true,
    min: 0
  },
  dutiesAndTariffs: {
    baseDuty: { 
      type: Number, 
      required: true,
      min: 0
    },
    specialTariffs: { 
      type: Number, 
      required: true,
      min: 0
    },
    totalDuties: { 
      type: Number, 
      required: true,
      min: 0
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
        required: true
      },
      description: { 
        type: String, 
        required: true
      }
    }]
  },
  additionalCosts: {
    customsClearance: { 
      type: Number, 
      required: true,
      min: 0
    },
    documentation: { 
      type: Number, 
      required: true,
      min: 0
    },
    insurance: { 
      type: Number, 
      required: true,
      min: 0
    },
    handling: { 
      type: Number, 
      required: true,
      min: 0
    },
    storage: { 
      type: Number, 
      required: true,
      min: 0
    }
  },
  totalCost: { 
    type: Number, 
    required: true,
    min: 0
  },
  breakdown: {
    transport: { 
      type: Number, 
      required: true,
      min: 0
    },
    duties: { 
      type: Number, 
      required: true,
      min: 0
    },
    fees: { 
      type: Number, 
      required: true,
      min: 0
    },
    insurance: { 
      type: Number, 
      required: true,
      min: 0
    },
    total: { 
      type: Number, 
      required: true,
      min: 0
    }
  },
  transitTime: {
    estimated: { 
      type: Number, 
      required: true,
      min: 0
    },
    confidence: { 
      type: Number, 
      required: true,
      min: 0,
      max: 1
    },
    factors: [{ 
      type: String 
    }]
  },
  validity: {
    from: { 
      type: Date, 
      required: true
    },
    to: { 
      type: Date, 
      required: true
    }
  },
  notes: [{ 
    type: String 
  }],
  calculationDate: { 
    type: Date, 
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
PricingResponseSchema.index({ 
  requestId: 1 
});

PricingResponseSchema.index({ 
  calculationDate: -1 
});

PricingResponseSchema.index({ 
  totalCost: 1 
});

export default mongoose.model<IPricingResponse>('PricingResponse', PricingResponseSchema); 