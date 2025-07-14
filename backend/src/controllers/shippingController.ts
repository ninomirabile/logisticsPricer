import { Request, Response } from 'express';

// Sample shipping routes data
const sampleRoutes = [
  {
    id: 'route-1',
    originCountry: 'CN',
    destinationCountry: 'US',
    transportType: 'sea',
    baseTransitTime: 21,
    customsDelay: 3,
    portCongestion: 2,
    restrictions: ['Container inspection required', 'Phytosanitary certificate for wooden packaging']
  },
  {
    id: 'route-2',
    originCountry: 'CN',
    destinationCountry: 'EU',
    transportType: 'sea',
    baseTransitTime: 28,
    customsDelay: 2,
    portCongestion: 1,
    restrictions: ['CE marking required', 'REACH compliance']
  },
  {
    id: 'route-3',
    originCountry: 'CN',
    destinationCountry: 'US',
    transportType: 'air',
    baseTransitTime: 3,
    customsDelay: 1,
    portCongestion: 0,
    restrictions: ['Dangerous goods declaration if applicable']
  }
];

// Sample document requirements
const documentRequirements = {
  'CN-US': {
    required: ['Commercial Invoice', 'Packing List', 'Bill of Lading'],
    conditional: ['Certificate of Origin', 'Phytosanitary Certificate'],
    optional: ['Insurance Certificate']
  },
  'CN-EU': {
    required: ['Commercial Invoice', 'Packing List', 'Bill of Lading'],
    conditional: ['Certificate of Origin', 'CE Declaration'],
    optional: ['Insurance Certificate', 'REACH Declaration']
  }
};

// Get available shipping routes
export const getShippingRoutes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originCountry, destinationCountry, transportType } = req.query;
    
    let routes = sampleRoutes;
    
    if (originCountry) {
      routes = routes.filter(route => 
        route.originCountry === (originCountry as string).toUpperCase()
      );
    }
    
    if (destinationCountry) {
      routes = routes.filter(route => 
        route.destinationCountry === (destinationCountry as string).toUpperCase()
      );
    }
    
    if (transportType) {
      routes = routes.filter(route => 
        route.transportType === transportType
      );
    }
    
    res.status(200).json({
      success: true,
      data: routes,
      count: routes.length
    });
  } catch (error) {
    console.error('Error getting shipping routes:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error retrieving shipping routes' }
    });
  }
};

// Calculate transit time
export const calculateTransitTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, transportType, urgency = 'standard' } = req.body;
    
    if (!origin || !destination || !transportType) {
      res.status(400).json({
        success: false,
        error: { message: 'origin, destination, and transportType are required' }
      });
      return;
    }
    
    // Find applicable route
    const route = sampleRoutes.find(r => 
      r.originCountry === origin.toUpperCase() &&
      r.destinationCountry === destination.toUpperCase() &&
      r.transportType === transportType
    );
    
    if (!route) {
      res.status(404).json({
        success: false,
        error: { message: 'No route found for the specified parameters' }
      });
      return;
    }
    
    // Calculate total transit time
    let totalTime = route.baseTransitTime + route.customsDelay + route.portCongestion;
    
    // Apply urgency multiplier
    const urgencyMultiplier = urgency === 'express' ? 0.7 : urgency === 'urgent' ? 0.5 : 1.0;
    totalTime = Math.round(totalTime * urgencyMultiplier);
    
    // Rimosso controllo su productType perché non più usato
    
    const confidence = 0.8; // Base confidence
    const factors = [
      `Base transit time: ${route.baseTransitTime} days`,
      `Customs processing: ${route.customsDelay} days`,
      `Port congestion: ${route.portCongestion} days`
    ];
    
    if (urgency !== 'standard') {
      factors.push(`${urgency} service applied`);
    }
    
    res.status(200).json({
      success: true,
      data: {
        baseTime: route.baseTransitTime,
        customsTime: route.customsDelay,
        congestionTime: route.portCongestion,
        totalTime,
        confidence,
        factors,
        routeId: route.id
      }
    });
  } catch (error) {
    console.error('Error calculating transit time:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error calculating transit time' }
    });
  }
};

// Get required documents
export const getRequiredDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originCountry, destinationCountry, transportType, value } = req.query;
    
    if (!originCountry || !destinationCountry) {
      res.status(400).json({
        success: false,
        error: { message: 'originCountry and destinationCountry are required' }
      });
      return;
    }
    
    const routeKey = `${originCountry}-${destinationCountry}`;
    const baseRequirements = documentRequirements[routeKey as keyof typeof documentRequirements] || {
      required: ['Commercial Invoice', 'Packing List'],
      conditional: [],
      optional: []
    };
    
    const documents = [
      ...baseRequirements.required.map(doc => ({
        type: doc,
        required: true,
        priority: 'high',
        description: `${doc} is mandatory for this shipment`
      })),
      ...baseRequirements.conditional.map(doc => ({
        type: doc,
        required: false,
        priority: 'medium',
        description: `${doc} may be required depending on product type`
      })),
      ...baseRequirements.optional.map(doc => ({
        type: doc,
        required: false,
        priority: 'low',
        description: `${doc} is optional but recommended`
      }))
    ];
    
    // Add transport-specific documents
    if (transportType === 'sea') {
      documents.push({
        type: 'Bill of Lading',
        required: true,
        priority: 'high',
        description: 'Required for maritime shipments'
      });
    } else if (transportType === 'air') {
      documents.push({
        type: 'Air Waybill',
        required: true,
        priority: 'high',
        description: 'Required for air freight shipments'
      });
    }
    
    // Add value-based requirements
    if (value && parseInt(value as string) > 2500) {
      documents.push({
        type: 'Certificate of Origin',
        required: true,
        priority: 'high',
        description: 'Required for shipments over $2,500'
      });
    }
    
    res.status(200).json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error getting required documents:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error retrieving required documents' }
    });
  }
};

// Generate customs document
export const generateDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentType, shipmentData } = req.body;
    
    if (!documentType || !shipmentData) {
      res.status(400).json({
        success: false,
        error: { message: 'documentType and shipmentData are required' }
      });
      return;
    }
    
    // This would typically generate actual document content
    // For now, we'll return a template structure
    const documentContent = {
      documentType,
      generatedAt: new Date().toISOString(),
      content: `Generated ${documentType} for shipment from ${shipmentData.origin} to ${shipmentData.destination}`,
      status: 'generated',
      template: `${documentType.toLowerCase().replace(/\s+/g, '_')}_template`,
      metadata: {
        origin: shipmentData.origin,
        destination: shipmentData.destination,
        cargo: shipmentData.cargo,
        transportType: shipmentData.transportType
      }
    };
    
    res.status(200).json({
      success: true,
      data: documentContent
    });
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error generating document' }
    });
  }
};

// Check shipping restrictions
export const checkRestrictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originCountry, destinationCountry } = req.query;
    
    if (!originCountry || !destinationCountry) {
      res.status(400).json({
        success: false,
        error: { message: 'originCountry and destinationCountry are required' }
      });
      return;
    }
    
    // Sample restrictions data
    const restrictions = {
      'CN-US': [
        'Section 301 tariffs may apply',
        'Container inspection required',
        'Phytosanitary certificate for wooden packaging'
      ],
      'CN-EU': [
        'CE marking required for certain products',
        'REACH compliance required',
        'RoHS compliance for electronics'
      ]
    };
    
    const routeKey = `${originCountry}-${destinationCountry}`;
    const routeRestrictions = restrictions[routeKey as keyof typeof restrictions] || [];
    
    // Rimosso controllo su productType perché non più usato
    
    res.status(200).json({
      success: true,
      data: {
        restrictions: routeRestrictions,
        count: routeRestrictions.length,
        severity: routeRestrictions.length > 0 ? 'medium' : 'low'
      }
    });
  } catch (error) {
    console.error('Error checking restrictions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error checking shipping restrictions' }
    });
  }
};

// Validate shipping route
export const validateRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originCountry, destinationCountry, transportType } = req.body;
    
    if (!originCountry || !destinationCountry || !transportType) {
      res.status(400).json({
        success: false,
        error: { message: 'originCountry, destinationCountry, and transportType are required' }
      });
      return;
    }
    
    // Check if route exists
    const route = sampleRoutes.find(r => 
      r.originCountry === originCountry.toUpperCase() &&
      r.destinationCountry === destinationCountry.toUpperCase() &&
      r.transportType === transportType
    );
    
    if (!route) {
      res.status(400).json({
        success: false,
        data: {
          valid: false,
          reason: 'Route not available',
          alternatives: sampleRoutes.filter(r => 
            r.originCountry === originCountry.toUpperCase() &&
            r.destinationCountry === destinationCountry.toUpperCase()
          )
        }
      });
      return;
    }
    
    // Check restrictions
    const restrictions = route.restrictions || [];
    const hasRestrictions = restrictions.length > 0;
    
    res.status(200).json({
      success: true,
      data: {
        valid: true,
        route: route,
        restrictions: restrictions,
        hasRestrictions,
        estimatedTransitTime: route.baseTransitTime + route.customsDelay + route.portCongestion
      }
    });
  } catch (error) {
    console.error('Error validating route:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error validating shipping route' }
    });
  }
}; 