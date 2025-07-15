import { Request, Response } from 'express';
import ShippingRoute from '../models/ShippingRoute';

// Get all shipping routes with optional filtering and pagination
export const getAllShippingRoutes = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      search = '',
      originCountry,
      destinationCountry,
      transportType,
      isActive
    } = req.query;
    
    const query: Record<string, unknown> = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { routeId: { $regex: search as string, $options: 'i' } },
        { originCountry: { $regex: search as string, $options: 'i' } },
        { destinationCountry: { $regex: search as string, $options: 'i' } },
        { notes: { $regex: search as string, $options: 'i' } }
      ];
    }
    
    if (originCountry) query.originCountry = (originCountry as string).toUpperCase();
    if (destinationCountry) query.destinationCountry = (destinationCountry as string).toUpperCase();
    if (transportType) query.transportType = transportType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const routes = await ShippingRoute.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await ShippingRoute.countDocuments(query);
    
    return res.json({
      success: true,
      data: routes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching shipping routes:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch shipping routes' }
    });
  }
};

// Get a single shipping route by ID
export const getShippingRouteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const route = await ShippingRoute.findById(id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        error: { message: 'Shipping route not found' }
      });
    }

    return res.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Error fetching shipping route:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch shipping route' }
    });
  }
};

// Create a new shipping route
export const createShippingRoute = async (req: Request, res: Response) => {
  try {
    const routeData = req.body;
    
    // Validate required fields
    if (!routeData.routeId || !routeData.originCountry || !routeData.destinationCountry || 
        !routeData.transportType || routeData.baseTransitTime === undefined) {
      return res.status(400).json({
        success: false,
        error: { message: 'Route ID, origin country, destination country, transport type, and base transit time are required' }
      });
    }

    // Check if route already exists
    const existingRoute = await ShippingRoute.findOne({ 
      routeId: routeData.routeId,
      isActive: true 
    });

    if (existingRoute) {
      return res.status(409).json({
        success: false,
        error: { message: 'A route with this ID already exists' }
      });
    }

    const newRoute = new ShippingRoute(routeData);
    const savedRoute = await newRoute.save();

    return res.status(201).json({
      success: true,
      data: savedRoute,
      message: 'Shipping route created successfully'
    });
  } catch (error) {
    console.error('Error creating shipping route:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to create shipping route' }
    });
  }
};

// Update an existing shipping route
export const updateShippingRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const route = await ShippingRoute.findById(id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        error: { message: 'Shipping route not found' }
      });
    }

    // Update the route
    Object.assign(route, updateData);
    const updatedRoute = await route.save();

    return res.json({
      success: true,
      data: updatedRoute,
      message: 'Shipping route updated successfully'
    });
  } catch (error) {
    console.error('Error updating shipping route:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update shipping route' }
    });
  }
};

// Delete a shipping route
export const deleteShippingRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const route = await ShippingRoute.findById(id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        error: { message: 'Shipping route not found' }
      });
    }

    await ShippingRoute.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Shipping route deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shipping route:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to delete shipping route' }
    });
  }
};

// Get shipping route statistics
export const getShippingRouteStats = async (req: Request, res: Response) => {
  try {
    const stats = await ShippingRoute.aggregate([
      {
        $group: {
          _id: null,
          totalRoutes: { $sum: 1 },
          activeRoutes: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          avgTransitTime: { $avg: '$baseTransitTime' },
          avgCustomsDelay: { $avg: '$customsDelay' }
        }
      }
    ]);

    const transportTypeStats = await ShippingRoute.aggregate([
      {
        $group: {
          _id: '$transportType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const countryStats = await ShippingRoute.aggregate([
      {
        $group: {
          _id: '$originCountry',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalRoutes: 0,
          activeRoutes: 0,
          avgTransitTime: 0,
          avgCustomsDelay: 0
        },
        transportTypes: transportTypeStats.map(item => ({ type: item._id, count: item.count })),
        topCountries: countryStats.map(item => ({ country: item._id, count: item.count }))
      }
    });
  } catch (error) {
    console.error('Error fetching shipping route stats:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch shipping route statistics' }
    });
  }
};

// Legacy function - Get available shipping routes (for backward compatibility)
export const getShippingRoutes = async (req: Request, res: Response) => {
  try {
    const { originCountry, destinationCountry, transportType } = req.query;
    
    let query: Record<string, unknown> = { isActive: true };
    
    if (originCountry) {
      query.originCountry = (originCountry as string).toUpperCase();
    }
    
    if (destinationCountry) {
      query.destinationCountry = (destinationCountry as string).toUpperCase();
    }
    
    if (transportType) {
      query.transportType = transportType;
    }
    
    const routes = await ShippingRoute.find(query).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      data: routes,
      count: routes.length
    });
  } catch (error) {
    console.error('Error getting shipping routes:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Error retrieving shipping routes' }
    });
  }
};

// Calculate transit time
export const calculateTransitTime = async (req: Request, res: Response) => {
  try {
    const { origin, destination, transportType, urgency = 'standard' } = req.body;
    
    if (!origin || !destination || !transportType) {
      return res.status(400).json({
        success: false,
        error: { message: 'origin, destination, and transportType are required' }
      });
    }
    
    // Find applicable route
    const route = await ShippingRoute.findOne({ 
      originCountry: (origin as string).toUpperCase(),
      destinationCountry: (destination as string).toUpperCase(),
      transportType: transportType
    });
    
    if (!route) {
      return res.status(404).json({
        success: false,
        error: { message: 'No route found for the specified parameters' }
      });
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
    
    return res.status(200).json({
      success: true,
      data: {
        baseTime: route.baseTransitTime,
        customsTime: route.customsDelay,
        congestionTime: route.portCongestion,
        totalTime,
        confidence,
        factors,
        routeId: route.routeId
      }
    });
  } catch (error) {
    console.error('Error calculating transit time:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Error calculating transit time' }
    });
  }
};

// Get required documents
export const getRequiredDocuments = async (req: Request, res: Response) => {
  try {
    const { originCountry, destinationCountry, transportType, value } = req.query;
    
    if (!originCountry || !destinationCountry) {
      return res.status(400).json({
        success: false,
        error: { message: 'originCountry and destinationCountry are required' }
      });
    }
    
    const route = await ShippingRoute.findOne({ 
      originCountry: (originCountry as string).toUpperCase(),
      destinationCountry: (destinationCountry as string).toUpperCase(),
      transportType: transportType
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        error: { message: 'No route found for the specified parameters' }
      });
    }
    
    const baseRequirements = {
      required: ['Commercial Invoice', 'Packing List', 'Bill of Lading'],
      conditional: ['Certificate of Origin', 'Phytosanitary Certificate'],
      optional: ['Insurance Certificate']
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
    
    return res.status(200).json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error getting required documents:', error);
    return res.status(500).json({
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
export const checkRestrictions = async (req: Request, res: Response) => {
  try {
    const { originCountry, destinationCountry } = req.query;
    
    if (!originCountry || !destinationCountry) {
      return res.status(400).json({
        success: false,
        error: { message: 'originCountry and destinationCountry are required' }
      });
    }
    
    const route = await ShippingRoute.findOne({ 
      originCountry: (originCountry as string).toUpperCase(),
      destinationCountry: (destinationCountry as string).toUpperCase()
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        error: { message: 'No route found for the specified parameters' }
      });
    }
    
    const routeRestrictions = route.restrictions || [];
    
    // Rimosso controllo su productType perché non più usato
    
    return res.status(200).json({
      success: true,
      data: {
        restrictions: routeRestrictions,
        count: routeRestrictions.length,
        severity: routeRestrictions.length > 0 ? 'medium' : 'low'
      }
    });
  } catch (error) {
    console.error('Error checking restrictions:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Error checking shipping restrictions' }
    });
  }
};

// Validate shipping route
export const validateRoute = async (req: Request, res: Response) => {
  try {
    const { originCountry, destinationCountry, transportType } = req.body;
    
    if (!originCountry || !destinationCountry || !transportType) {
      return res.status(400).json({
        success: false,
        error: { message: 'originCountry, destinationCountry, and transportType are required' }
      });
    }
    
    // Check if route exists
    const route = await ShippingRoute.findOne({ 
      originCountry: (originCountry as string).toUpperCase(),
      destinationCountry: (destinationCountry as string).toUpperCase(),
      transportType: transportType
    });
    
    if (!route) {
      return res.status(400).json({
        success: false,
        data: {
          valid: false,
          reason: 'Route not available',
          alternatives: await ShippingRoute.find({ 
            originCountry: (originCountry as string).toUpperCase(),
            destinationCountry: (destinationCountry as string).toUpperCase()
          }).sort({ baseTransitTime: 1 })
        }
      });
    }
    
    // Check restrictions
    const restrictions = route.restrictions || [];
    const hasRestrictions = restrictions.length > 0;
    
    return res.status(200).json({
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
    return res.status(500).json({
      success: false,
      error: { message: 'Error validating shipping route' }
    });
  }
}; 