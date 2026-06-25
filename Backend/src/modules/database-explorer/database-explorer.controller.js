const mongoose = require('mongoose');
const { Types } = mongoose;

const getCollections = async (req, res, next) => {
  try {
    const models = mongoose.modelNames();
    const stats = [];

    for (const modelName of models) {
      const Model = mongoose.model(modelName);
      const count = await Model.countDocuments();
      // Basic heuristic for deleted documents if isDeleted exists
      const deletedCount = Model.schema.path('isDeleted') 
        ? await Model.countDocuments({ isDeleted: true }) 
        : 0;

      // Check if there's any record created today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const createdToday = Model.schema.path('createdAt') 
        ? await Model.countDocuments({ createdAt: { $gte: startOfDay } })
        : 0;
      
      const updatedToday = Model.schema.path('updatedAt')
        ? await Model.countDocuments({ updatedAt: { $gte: startOfDay } })
        : 0;

      stats.push({
        name: Model.collection.name,
        modelName,
        count,
        deletedCount,
        createdToday,
        updatedToday,
        // Approximate size could be fetched with collection.stats(), but it often requires admin db privileges
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getCollectionDocuments = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { page = 1, limit = 100, sort, order, search, filter } = req.query;

    const Model = mongoose.models[name];
    if (!Model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }

    const query = {};
    
    // Global search across string fields
    if (search) {
      const stringPaths = Object.keys(Model.schema.paths).filter(
        path => Model.schema.paths[path].instance === 'String'
      );
      if (stringPaths.length > 0) {
        query.$or = stringPaths.map(path => ({
          [path]: { $regex: search, $options: 'i' }
        }));
      }
    }

    // Apply specific filters (from Query Builder)
    if (filter) {
      try {
        const parsedFilter = JSON.parse(filter);
        Object.assign(query, parsedFilter);
      } catch (e) {
        // invalid JSON filter
      }
    }

    const sortObj = {};
    if (sort) {
      sortObj[sort] = order === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = -1; // default sort
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const documents = await Model.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Lean for performance

    const total = await Model.countDocuments(query);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const { name, id } = req.params;
    const Model = mongoose.models[name];
    
    if (!Model) return res.status(404).json({ success: false, message: 'Model not found' });
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const document = await Model.findById(id).lean();
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const { name, id } = req.params;
    const Model = mongoose.models[name];
    
    if (!Model) return res.status(404).json({ success: false, message: 'Model not found' });

    // Validate using Mongoose schema before saving
    const doc = await Model.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // We can use doc.set() and doc.save() to trigger validations
    doc.set(req.body);
    await doc.save();

    res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { name, id } = req.params;
    const Model = mongoose.models[name];
    
    if (!Model) return res.status(404).json({ success: false, message: 'Model not found' });

    // Implement soft delete if possible
    if (Model.schema.path('isDeleted')) {
      const doc = await Model.findById(id);
      if (doc) {
        doc.isDeleted = true;
        doc.deletedAt = new Date();
        // Assuming req.user exists from auth middleware
        if (req.user) doc.deletedBy = req.user.id;
        await doc.save();
        return res.json({ success: true, message: 'Document soft deleted', data: doc });
      }
    } else {
      // Hard delete if soft delete not supported by schema
      await Model.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Document permanently deleted' });
    }
  } catch (error) {
    next(error);
  }
};

const restoreDocument = async (req, res, next) => {
    try {
      const { name, id } = req.params;
      const Model = mongoose.models[name];
      
      if (!Model) return res.status(404).json({ success: false, message: 'Model not found' });
  
      if (Model.schema.path('isDeleted')) {
        const doc = await Model.findById(id);
        if (doc) {
          doc.isDeleted = false;
          doc.deletedAt = undefined;
          doc.deletedBy = undefined;
          await doc.save();
          return res.json({ success: true, message: 'Document restored', data: doc });
        }
      }
      res.status(400).json({ success: false, message: 'Restore not supported on this collection' });
    } catch (error) {
      next(error);
    }
};

const getSchema = async (req, res, next) => {
    try {
      const { name } = req.params;
      const Model = mongoose.models[name];
      
      if (!Model) return res.status(404).json({ success: false, message: 'Model not found' });
  
      const schemaFields = [];
      Model.schema.eachPath((path, type) => {
        schemaFields.push({
          path,
          type: type.instance || type.constructor.name,
          isRequired: !!type.isRequired,
          isUnique: !!type.options.unique,
          hasDefault: type.options.default !== undefined,
          defaultValue: type.options.default,
          ref: type.options.ref || (type.options.type && type.options.type[0] && type.options.type[0].ref)
        });
      });
  
      res.json({ success: true, data: schemaFields });
    } catch (error) {
      next(error);
    }
};

const getRelationships = async (req, res, next) => {
    try {
      const models = mongoose.modelNames();
      const relationships = [];
  
      for (const modelName of models) {
        const Model = mongoose.models[modelName];
        Model.schema.eachPath((path, type) => {
          const ref = type.options.ref || (type.options.type && Array.isArray(type.options.type) && type.options.type[0] && type.options.type[0].ref);
          if (ref) {
            relationships.push({
              source: modelName,
              target: ref,
              path
            });
          }
        });
      }
  
      res.json({ success: true, data: relationships });
    } catch (error) {
      next(error);
    }
};

const globalSearch = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

        const models = mongoose.modelNames();
        const results = [];

        // Simple parallel search across collections
        const searchPromises = models.map(async (modelName) => {
            const Model = mongoose.models[modelName];
            const stringPaths = Object.keys(Model.schema.paths).filter(
                path => Model.schema.paths[path].instance === 'String'
            );
            
            if (stringPaths.length === 0) return { modelName, matches: [] };

            const searchQuery = {
                $or: stringPaths.map(path => ({
                    [path]: { $regex: query, $options: 'i' }
                }))
            };

            // Limit to 5 matches per collection to avoid massive payloads
            const matches = await Model.find(searchQuery).limit(5).lean();
            return { modelName, count: matches.length, matches };
        });

        const allResults = await Promise.all(searchPromises);
        
        for (const result of allResults) {
            if (result.count > 0) {
                results.push(result);
            }
        }

        res.json({ success: true, data: results });
    } catch (error) {
        next(error);
    }
};

const getHealthChecks = async (req, res, next) => {
    try {
        // Mocking some health checks or implementing simple orphan checks
        // Implementing real orphan checks can be expensive on large DBs. 
        // Returning simulated or limited health checks.
        
        const issues = [];
        
        // Let's do a sample check: Orders without Users if User ref exists on Order
        if (mongoose.models.Order && mongoose.models.User) {
            const orphanOrders = await mongoose.models.Order.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDoc'
                    }
                },
                {
                    $match: {
                        userDoc: { $size: 0 },
                        user: { $exists: true, $ne: null }
                    }
                },
                { $limit: 100 }
            ]);
            
            if (orphanOrders.length > 0) {
                issues.push({
                    type: 'Orphan Records',
                    collection: 'Order',
                    count: orphanOrders.length,
                    severity: 'High',
                    description: 'Orders found with a missing or invalid user reference.'
                });
            }
        }

        res.json({
            success: true,
            data: {
                status: issues.length > 0 ? 'Warning' : 'Healthy',
                issues,
                lastChecked: new Date()
            }
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
  getCollections,
  getCollectionDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  restoreDocument,
  getSchema,
  getRelationships,
  globalSearch,
  getHealthChecks
};
