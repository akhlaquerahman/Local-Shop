const Configuration = require('../../models/Configuration');
const Integration = require('../../models/Integration');
const configService = require('../../services/config.service');

const getConfigurations = async (req, res, next) => {
  try {
    const { category, tenantId = 'GLOBAL' } = req.query;
    const query = { tenantId };
    if (category) query.category = category;

    const configs = await Configuration.find(query).lean();

    // Mask secret values before sending to frontend
    const maskedConfigs = configs.map(config => {
      if (config.isSecret) {
        return { ...config, value: '********' }; // Masked
      }
      return config;
    });

    res.json({ success: true, data: maskedConfigs });
  } catch (error) {
    next(error);
  }
};

const setConfiguration = async (req, res, next) => {
  try {
    const { key, value, category, provider, isSecret, description, tenantId } = req.body;
    const userId = req.user ? req.user.id : null;

    const config = await configService.setConfig({
      key, value, category, provider, isSecret, description, tenantId
    }, userId);

    res.json({ success: true, data: { ...config.toObject(), value: isSecret ? '********' : config.value } });
  } catch (error) {
    next(error);
  }
};

const deleteConfiguration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const config = await Configuration.findById(id);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    await Configuration.findByIdAndDelete(id);
    
    // Invalidate from cache
    const cacheKey = config.tenantId === 'GLOBAL' ? config.key : `${config.tenantId}:${config.key}`;
    configService.cache.delete(cacheKey);

    res.json({ success: true, message: 'Configuration deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const revealSecret = async (req, res, next) => {
  try {
    const { id } = req.params;
    const config = await Configuration.findById(id);

    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    if (!config.isSecret) {
      return res.json({ success: true, data: config.value });
    }

    // Require extra authorization or re-auth here (skipped for mock)
    const decryptedValue = configService.decrypt(config.value);

    // Audit log this reveal event (TODO)

    res.json({ success: true, data: decryptedValue });
  } catch (error) {
    next(error);
  }
};

// Integrations
const getIntegrations = async (req, res, next) => {
  try {
    const integrations = await Integration.find().lean();
    const masked = integrations.map(i => ({
      ...i,
      apiKey: i.apiKey ? '********' : undefined,
      secretKey: i.secretKey ? '********' : undefined,
    }));
    res.json({ success: true, data: masked });
  } catch (error) {
    next(error);
  }
};

const saveIntegration = async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.user ? req.user.id : null;
    
    if (data.apiKey && data.apiKey !== '********') {
      data.apiKey = configService.encrypt(data.apiKey);
    } else {
      delete data.apiKey;
    }

    if (data.secretKey && data.secretKey !== '********') {
      data.secretKey = configService.encrypt(data.secretKey);
    } else {
      delete data.secretKey;
    }

    data.updatedBy = userId;

    let integration;
    if (data._id) {
      integration = await Integration.findByIdAndUpdate(data._id, data, { new: true });
    } else {
      data.createdBy = userId;
      integration = await Integration.create(data);
    }

    res.json({ success: true, data: integration });
  } catch (error) {
    next(error);
  }
};

const testIntegration = async (req, res, next) => {
  try {
    const { id } = req.body;
    // Mock testing logic for any integration
    setTimeout(() => {
      res.json({ success: true, message: 'Connection successful' });
    }, 1500);
  } catch (error) {
    next(error);
  }
};

const revealIntegrationSecret = async (req, res, next) => {
  try {
    const { id } = req.params;
    const integration = await Integration.findById(id);

    if (!integration) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }

    if (!integration.apiKey) {
      return res.json({ success: true, data: null });
    }

    const decryptedValue = configService.decrypt(integration.apiKey);

    res.json({ success: true, data: decryptedValue });
  } catch (error) {
    next(error);
  }
};

const reloadCache = async (req, res, next) => {
  try {
    await configService.reloadCache();
    res.json({ success: true, message: 'Cache reloaded successfully across node.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConfigurations,
  setConfiguration,
  deleteConfiguration,
  revealSecret,
  getIntegrations,
  saveIntegration,
  testIntegration,
  revealIntegrationSecret,
  reloadCache
};
