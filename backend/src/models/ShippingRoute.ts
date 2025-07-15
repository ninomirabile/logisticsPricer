import mongoose, { Document, Schema } from 'mongoose';

export interface IShippingRoute extends Document {
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
  effectiveDate: Date;
  expiryDate?: Date;
  notes?: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const shippingRouteSchema = new Schema<IShippingRoute>({
  routeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  transportType: {
    type: String,
    required: true,
    enum: ['road', 'air', 'sea', 'rail', 'multimodal']
  },
  baseTransitTime: {
    type: Number,
    required: true,
    min: 0
  },
  customsDelay: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  portCongestion: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  restrictions: [{
    type: String,
    trim: true
  }],
  requirements: {
    documents: [{
      type: {
        type: String,
        required: true,
        trim: true
      },
      required: {
        type: Boolean,
        default: false
      },
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      },
      description: {
        type: String,
        trim: true
      }
    }],
    specialHandling: [{
      type: String,
      trim: true
    }],
    certifications: [{
      type: String,
      trim: true
    }]
  },
  costs: {
    baseCost: {
      type: Number,
      required: true,
      min: 0
    },
    customsFees: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    portFees: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    additionalFees: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
shippingRouteSchema.index({ originCountry: 1, destinationCountry: 1, transportType: 1 });
shippingRouteSchema.index({ routeId: 1 });
shippingRouteSchema.index({ isActive: 1 });
shippingRouteSchema.index({ effectiveDate: 1, expiryDate: 1 });

// Static method to find active routes by origin and destination
shippingRouteSchema.statics.findActiveByRoute = function(originCountry: string, destinationCountry: string, transportType: string) {
  return this.find({
    originCountry: originCountry.toUpperCase(),
    destinationCountry: destinationCountry.toUpperCase(),
    transportType,
    isActive: true,
    effectiveDate: { $lte: new Date() },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  }).sort({ effectiveDate: -1 });
};

// Static method to find routes by HS code restrictions
shippingRouteSchema.statics.findByRestrictions = function(restrictions: string[]) {
  return this.find({
    isActive: true,
    restrictions: { $in: restrictions },
    effectiveDate: { $lte: new Date() },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  });
};

// Virtual for total transit time
shippingRouteSchema.virtual('totalTransitTime').get(function() {
  return this.baseTransitTime + this.customsDelay + this.portCongestion;
});

// Virtual for total cost
shippingRouteSchema.virtual('totalCost').get(function() {
  return this.costs.baseCost + this.costs.customsFees + this.costs.portFees + this.costs.additionalFees;
});

// Ensure virtuals are included in JSON output
shippingRouteSchema.set('toJSON', { virtuals: true });
shippingRouteSchema.set('toObject', { virtuals: true });

export const ShippingRoute = mongoose.model<IShippingRoute>('ShippingRoute', shippingRouteSchema);
export default ShippingRoute; 