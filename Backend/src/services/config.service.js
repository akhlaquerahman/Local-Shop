const crypto = require('crypto');
const Configuration = require('../models/Configuration');

const ALGORITHM = 'aes-256-cbc';
// Fallback key if not set in environment (for development purposes only)
const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY || 'default-insecure-master-key-32b!'; 
// Ensure key is 32 bytes for aes-256-cbc
const keyBuf = crypto.scryptSync(MASTER_KEY, 'salt', 32);

class ConfigService {
  constructor() {
    this.cache = new Map();
    this.isLoaded = false;
  }

  // Encrypt a value
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuf, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  // Decrypt a value
  decrypt(text) {
    if (!text || !text.includes(':')) return text;
    try {
      const parts = text.split(':');
      const iv = Buffer.from(parts.shift(), 'hex');
      const encryptedText = Buffer.from(parts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, keyBuf, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      console.error('Failed to decrypt value. Missing or invalid MASTER_ENCRYPTION_KEY?', e);
      return text;
    }
  }

  // Load all active configurations into memory
  async loadCache() {
    try {
      const configs = await Configuration.find({ isActive: true });
      this.cache.clear();
      configs.forEach(config => {
        let value = config.value;
        if (config.isSecret) {
          value = this.decrypt(value);
        }
        // Handle global vs tenant keys in a structured way
        const cacheKey = config.tenantId === 'GLOBAL' ? config.key : `${config.tenantId}:${config.key}`;
        this.cache.set(cacheKey, value);
      });
      this.isLoaded = true;
      // console.log(`[ConfigService] Loaded ${configs.length} configurations into memory cache.`);
    } catch (error) {
      console.error('[ConfigService] Error loading cache:', error);
    }
  }

  // Get a value with fallback to process.env
  get(key, tenantId = 'GLOBAL', defaultValue = null) {
    if (!this.isLoaded) {
      // If not yet loaded from DB, fallback strictly to env
      return process.env[key] !== undefined ? process.env[key] : defaultValue;
    }

    const tenantKey = `${tenantId}:${key}`;
    if (tenantId !== 'GLOBAL' && this.cache.has(tenantKey)) {
      return this.cache.get(tenantKey);
    }

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    return process.env[key] !== undefined ? process.env[key] : defaultValue;
  }

  // Force cache reload (can be exposed via an API endpoint for other nodes)
  async reloadCache() {
    await this.loadCache();
  }

  // Create or Update a configuration
  async setConfig({ key, value, category, provider, isSecret, description, tenantId = 'GLOBAL' }, userId) {
    let storedValue = value;
    if (isSecret) {
      storedValue = this.encrypt(value);
    }

    const config = await Configuration.findOneAndUpdate(
      { key, tenantId },
      {
        value: storedValue,
        category,
        provider,
        isSecret,
        description,
        updatedBy: userId
      },
      { new: true, upsert: true }
    );

    // Update local cache immediately
    const cacheKey = tenantId === 'GLOBAL' ? key : `${tenantId}:${key}`;
    this.cache.set(cacheKey, value);

    return config;
  }
}

// Export a singleton instance
const configService = new ConfigService();

// Auto-load on required
configService.loadCache();

module.exports = configService;
