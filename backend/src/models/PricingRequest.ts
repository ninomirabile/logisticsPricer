import mongoose, { Document, Schema } from 'mongoose';

export interface IPricingRequest extends Document {
  // Basic information
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
  
  // Cargo details
  cargo: {
    weight: number; // kg
    volume: number; // m³
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    hsCode: string;
    productDescription: string;
    value: number; // USD
    quantity: number;
  };
  
  // Transport details
  transport: {
    type: 'road' | 'air' | 'sea' | 'rail' | 'multimodal';
    urgency: 'standard' | 'express' | 'urgent';
    specialRequirements: string[];
  };
  
  // Additional options
  options: {
    insurance: boolean;
    customsClearance: boolean;
    doorToDoor: boolean;
    temperatureControlled: boolean;
  };
  
  // Legacy fields for backward compatibility
  weight: number;
  volume: number;
  transportType: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'calculated' | 'expired' | 'cancelled';
}

const PricingRequestSchema = new Schema<IPricingRequest>({
  origin: {
    country: { type: String, required: true },
    city: { type: String, required: true },
    coordinates: { type: [Number], required: false }
  },
  destination: {
    country: { type: String, required: true },
    city: { type: String, required: true },
    coordinates: { type: [Number], required: false }
  },
  cargo: {
    weight: { type: Number, required: true, min: 0.01 },
    volume: { type: Number, required: true, min: 0.01 },
    dimensions: {
      length: { type: Number, required: true, min: 0.01 },
      width: { type: Number, required: true, min: 0.01 },
      height: { type: Number, required: true, min: 0.01 }
    },
    hsCode: { type: String, required: true },
    productDescription: { type: String, required: true },
    value: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  transport: {
    type: { 
      type: String, 
      required: true, 
      enum: ['road', 'air', 'sea', 'rail', 'multimodal'] 
    },
    urgency: { 
      type: String, 
      required: true, 
      enum: ['standard', 'express', 'urgent'],
      default: 'standard'
    },
    specialRequirements: [{ type: String }]
  },
  options: {
    insurance: { type: Boolean, default: false },
    customsClearance: { type: Boolean, default: false },
    doorToDoor: { type: Boolean, default: false },
    temperatureControlled: { type: Boolean, default: false }
  },
  
  // Legacy fields for backward compatibility
  weight: { type: Number, required: false },
  volume: { type: Number, required: false },
  transportType: { type: String, required: false },
  
  // Metadata
  status: { 
    type: String, 
    enum: ['pending', 'calculated', 'expired', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Pre-save middleware to populate legacy fields
PricingRequestSchema.pre('save', function(next) {
  if (!this.weight) {
    this.weight = this.cargo.weight;
  }
  if (!this.volume) {
    this.volume = this.cargo.volume;
  }
  if (!this.transportType) {
    this.transportType = this.transport.type;
  }
  next();
});

export default mongoose.model<IPricingRequest>('PricingRequest', PricingRequestSchema); 