import mongoose, { Document, Schema } from 'mongoose';

export interface IUSDuty extends Document {
  hsCode: string;
  productDescription: string;
  baseRate: number;
  section301Rate?: number;
  section232Rate?: number;
  section201Rate?: number;
  effectiveDate: Date;
  expiryDate?: Date;
  source: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const USDutySchema = new Schema<IUSDuty>({
  hsCode: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  productDescription: {
    type: String,
    required: true,
    trim: true
  },
  baseRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  section301Rate: {
    type: Number,
    min: 0,
    max: 100
  },
  section232Rate: {
    type: Number,
    min: 0,
    max: 100
  },
  section201Rate: {
    type: Number,
    min: 0,
    max: 100
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  source: {
    type: String,
    required: true,
    enum: ['USTR', 'DOC', 'CBP', 'MANUAL'],
    default: 'MANUAL'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
USDutySchema.index({ hsCode: 1, isActive: 1 });
USDutySchema.index({ source: 1, isActive: 1 });
USDutySchema.index({ effectiveDate: -1 });

// Virtual for getting the current applicable rate
USDutySchema.virtual('currentRate').get(function() {
  const now = new Date();
  if (this.expiryDate && now > this.expiryDate) {
    return null; // Rate has expired
  }
  
  // Return the highest applicable rate
  const rates = [this.baseRate, this.section301Rate, this.section232Rate, this.section201Rate]
    .filter(rate => rate !== undefined && rate !== null);
  
  return rates.length > 0 ? Math.max(...rates) : this.baseRate;
});

// Method to check if duty is currently active
USDutySchema.methods.isCurrentlyActive = function(): boolean {
  const now = new Date();
  return this.isActive && 
         this.effectiveDate <= now && 
         (!this.expiryDate || this.expiryDate > now);
};

// Static method to find active duties by HS code
USDutySchema.statics.findActiveByHSCode = function(hsCode: string) {
  const now = new Date();
  return this.find({
    hsCode,
    isActive: true,
    effectiveDate: { $lte: now },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: now } }
    ]
  }).sort({ effectiveDate: -1 });
};

export const USDuty = mongoose.model<IUSDuty>('USDuty', USDutySchema); 