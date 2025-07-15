# USA Duties Module Documentation

## Overview

The USA Duties Module is a specialized component of LogisticsPricer designed to handle US import duties, taxes, and compliance requirements. This module provides comprehensive functionality for managing US customs operations and calculating accurate duty costs.

## 🚀 Quick Access

- **Admin Interface**: http://localhost:3000/admin/usa-duties
- **API Endpoints**: http://localhost:5000/api/usa-duties
- **Documentation**: This guide

## 🇺🇸 US Import Process Overview

### Import Flow
1. **Product Classification**: Determine HS (Harmonized System) codes
2. **Duty Calculation**: Calculate applicable customs duties
3. **Tax Assessment**: Apply sales tax, excise tax, etc.
4. **Fee Calculation**: Add processing and handling fees
5. **Documentation**: Generate required import documents
6. **Compliance Check**: Verify regulatory requirements

## 📊 Module Features

### 1. Duty Rate Management
Manage US customs duty rates and classifications:

#### HS Code Management
- **Product Classification**: Assign HS codes to products
- **Rate Lookup**: Real-time duty rate queries
- **Category Management**: Organize products by category
- **Rate Updates**: Track rate changes over time

#### Duty Calculation Engine
```typescript
interface DutyCalculation {
  productId: string;
  hsCode: string;
  originCountry: string;
  value: number;
  quantity: number;
  dutyRate: number;
  dutyAmount: number;
  totalCost: number;
}
```

### 2. Tax Management
Handle various US taxes and fees:

#### Sales Tax
- **State Rates**: Different rates by state
- **Local Rates**: County and city taxes
- **Exemptions**: Tax-exempt categories
- **Registration**: Tax registration requirements

#### Excise Taxes
- **Product-Specific**: Taxes on specific goods
- **Rate Tables**: Current excise tax rates
- **Exemptions**: Exempt product categories
- **Reporting**: Tax reporting requirements

### 3. Compliance Management
Ensure regulatory compliance:

#### Documentation Requirements
- **Commercial Invoice**: Required import document
- **Packing List**: Detailed shipment contents
- **Certificate of Origin**: Product origin verification
- **Customs Declaration**: Import declaration forms

#### Regulatory Compliance
- **FDA Requirements**: Food and drug regulations
- **EPA Standards**: Environmental protection
- **Safety Standards**: Product safety requirements
- **Labeling Requirements**: Product labeling rules

### 4. Currency Management
Handle exchange rates and currency conversion:

#### Exchange Rate Integration
- **Real-time Rates**: Live currency conversion
- **Rate History**: Historical rate tracking
- **Multiple Currencies**: Support for various currencies
- **Rate Alerts**: Exchange rate notifications

## 🛠️ Technical Implementation

### Database Schema

#### Duty Rates Collection
```typescript
interface DutyRate {
  _id: ObjectId;
  hsCode: string;
  description: string;
  dutyRate: number;
  effectiveDate: Date;
  expiryDate?: Date;
  countryOfOrigin: string;
  specialNotes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Tax Rates Collection
```typescript
interface TaxRate {
  _id: ObjectId;
  taxType: 'sales' | 'excise' | 'processing';
  jurisdiction: string; // State, county, city
  rate: number;
  effectiveDate: Date;
  expiryDate?: Date;
  applicableProducts?: string[];
  exemptions?: string[];
  isActive: boolean;
}
```

#### Product Classification Collection
```typescript
interface ProductClassification {
  _id: ObjectId;
  productId: string;
  productName: string;
  hsCode: string;
  description: string;
  category: string;
  originCountry: string;
  dutyRate: number;
  specialRequirements?: string[];
  complianceNotes?: string;
}
```

### API Endpoints

#### Duty Calculation
```typescript
// Calculate duties for a shipment
POST /api/usa-duties/calculate
{
  "products": [
    {
      "productId": "string",
      "quantity": "number",
      "value": "number",
      "originCountry": "string"
    }
  ],
  "destinationState": "string",
  "currency": "string"
}

// Response
{
  "success": true,
  "calculation": {
    "totalDuty": "number",
    "totalTax": "number",
    "totalFees": "number",
    "totalCost": "number",
    "breakdown": {
      "duties": "array",
      "taxes": "array",
      "fees": "array"
    }
  }
}
```

#### Rate Management
```typescript
// Get duty rates
GET /api/usa-duties/rates?hsCode=string&country=string

// Update duty rate
PUT /api/usa-duties/rates/:id
{
  "dutyRate": "number",
  "effectiveDate": "Date",
  "notes": "string"
}

// Get tax rates
GET /api/usa-duties/taxes?type=string&jurisdiction=string
```

### Frontend Components

#### USDutiesManagement.tsx
Main component for the USA Duties management interface:

```typescript
interface USDutiesManagementProps {
  onDutyCalculation: (calculation: DutyCalculation) => void;
  onRateUpdate: (rate: DutyRate) => void;
  onTaxUpdate: (tax: TaxRate) => void;
}
```

#### DutyCalculator.tsx
Component for calculating duties:

```typescript
interface DutyCalculatorProps {
  products: Product[];
  destination: string;
  currency: string;
  onCalculate: (result: CalculationResult) => void;
}
```

#### RateManager.tsx
Component for managing duty and tax rates:

```typescript
interface RateManagerProps {
  rates: (DutyRate | TaxRate)[];
  onAdd: (rate: DutyRate | TaxRate) => void;
  onEdit: (id: string, rate: Partial<DutyRate | TaxRate>) => void;
  onDelete: (id: string) => void;
}
```

## 📱 User Interface

### Admin Dashboard Integration
The USA Duties module is fully integrated into the admin dashboard:

- **Navigation**: Accessible via `/admin/usa-duties`
- **Responsive Design**: Works on all device sizes
- **Real-time Updates**: Live data synchronization
- **Bulk Operations**: Mass data management

### Key Interface Elements

#### Duty Calculator Form
- **Product Selection**: Choose products from catalog
- **Quantity Input**: Specify quantities and values
- **Origin Selection**: Select country of origin
- **Destination Input**: Specify US destination
- **Calculation Button**: Trigger duty calculation
- **Results Display**: Show detailed breakdown

#### Rate Management Table
- **HS Code Column**: Product classification codes
- **Description Column**: Product descriptions
- **Rate Column**: Current duty rates
- **Effective Date**: Rate validity period
- **Actions Column**: Edit/delete operations

#### Tax Configuration Panel
- **Tax Type Selection**: Sales, excise, processing
- **Jurisdiction Input**: State, county, city
- **Rate Input**: Tax rate percentage
- **Exemption Management**: Tax exemption rules

## 🔧 Configuration

### Environment Variables
```bash
# USA Duties Configuration
USA_DUTIES_ENABLED=true
EXCHANGE_RATE_API_KEY=your-api-key
CUSTOMS_API_ENDPOINT=https://api.customs.gov
TAX_RATE_UPDATE_INTERVAL=24h
DUTY_RATE_CACHE_TTL=3600
```

### Feature Flags
```typescript
interface USDutiesConfig {
  enabled: boolean;
  realTimeRates: boolean;
  complianceChecking: boolean;
  documentGeneration: boolean;
  currencyConversion: boolean;
  taxCalculation: boolean;
}
```

## 📊 Data Sources

### Duty Rate Sources
- **US Customs**: Official duty rate database
- **Harmonized Tariff Schedule**: HTS code classifications
- **Trade Agreements**: Free trade agreement rates
- **Special Programs**: GSP, AGOA, etc.

### Tax Rate Sources
- **State Tax Authorities**: Official state tax rates
- **Local Tax Offices**: County and city rates
- **Federal Agencies**: Federal tax requirements
- **Industry Databases**: Specialized tax databases

### Exchange Rate Sources
- **Federal Reserve**: Official exchange rates
- **Commercial APIs**: Real-time rate services
- **Banking Institutions**: Financial institution rates
- **Currency Markets**: Live market rates

## 🚨 Error Handling

### Common Issues
1. **Rate Not Found**: HS code not in database
2. **Invalid Classification**: Incorrect product classification
3. **Rate Expired**: Duty rate past expiration date
4. **Currency Error**: Exchange rate unavailable
5. **Compliance Violation**: Regulatory requirement not met

### Error Recovery
- **Fallback Rates**: Use default rates when specific rates unavailable
- **Manual Override**: Allow manual rate entry
- **Validation Warnings**: Alert users to potential issues
- **Compliance Checks**: Verify regulatory requirements

## 🔒 Security & Compliance

### Data Security
- **Encrypted Storage**: Sensitive data encryption
- **Access Control**: Role-based permissions
- **Audit Logging**: Complete action tracking
- **Data Backup**: Regular data backups

### Regulatory Compliance
- **US Customs Compliance**: Follow customs regulations
- **Tax Law Compliance**: Adhere to tax requirements
- **Data Privacy**: Protect sensitive information
- **Document Retention**: Maintain required records

## 📈 Performance Optimization

### Caching Strategy
- **Rate Caching**: Cache duty and tax rates
- **Exchange Rate Caching**: Cache currency rates
- **Calculation Caching**: Cache frequent calculations
- **Document Caching**: Cache generated documents

### Performance Metrics
- **Calculation Speed**: <2 seconds for complex calculations
- **Rate Lookup**: <500ms for rate queries
- **Document Generation**: <5 seconds for documents
- **Bulk Operations**: <10 seconds for 100 items

## 🧪 Testing

### Test Scenarios
- **Duty Calculation**: Verify accurate duty calculations
- **Tax Calculation**: Test tax rate applications
- **Currency Conversion**: Validate exchange rate handling
- **Compliance Checking**: Test regulatory compliance
- **Document Generation**: Verify document accuracy

### Test Data
- **Sample Products**: Test product classifications
- **Rate Scenarios**: Various duty rate scenarios
- **Tax Scenarios**: Different tax situations
- **Currency Scenarios**: Multiple currency conversions

## 🔄 Future Enhancements

### Planned Features
- **AI Classification**: Automated HS code classification
- **Real-time Compliance**: Live compliance checking
- **Document Automation**: Automated document generation
- **Integration APIs**: Third-party service integration
- **Advanced Analytics**: Detailed duty analysis

### Integration Roadmap
- **Customs APIs**: Direct customs service integration
- **Tax Services**: Tax calculation service integration
- **Shipping APIs**: Shipping service integration
- **Compliance Services**: Regulatory compliance services
- **Financial Services**: Banking and payment integration

## 📞 Support

### Getting Help
- **Documentation**: Check this guide first
- **API Documentation**: Review API endpoints
- **Error Messages**: Check error descriptions
- **Logs**: Review system logs
- **Support Team**: Contact technical support

### Common Tasks
- **Adding New Products**: Use product classification interface
- **Updating Rates**: Use rate management interface
- **Calculating Duties**: Use duty calculator
- **Generating Documents**: Use document generation
- **Checking Compliance**: Use compliance checker

---

*Last updated: July 2025* 