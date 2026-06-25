const { GoogleGenAI } = require('@google/genai');
const Integration = require('../../../models/Integration');
const configService = require('../../../services/config.service');

class GeminiService {
  constructor() {
    // Fallback to dummy key if neither DB nor .env has it
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy_key'
    });
    this.chatModel = 'gemini-2.5-flash';
    this.embeddingModel = 'embedding-001';
    this.currentKey = process.env.GEMINI_API_KEY || 'dummy_key';
    this.lastDbCheck = 0;
  }

  /**
   * Initialize API Key dynamically from Configuration Center (Database)
   * Caches for 30 seconds to avoid spamming the DB on every request.
   */
  async ensureInitialized() {
    const now = Date.now();
    if (now - this.lastDbCheck < 30000) return; // cache for 30 seconds
    
    try {
      const integration = await Integration.findOne({ providerName: 'Gemini AI', status: 'ACTIVE' });
      if (integration && integration.apiKey) {
        if (integration.apiKey !== this.currentKey) {
          this.currentKey = integration.apiKey;
          const decryptedKey = configService.decrypt(this.currentKey);
          this.ai = new GoogleGenAI({ apiKey: decryptedKey });
          console.log('[GeminiService] API Key dynamically updated from Database.');
        }
      } else if (!process.env.GEMINI_API_KEY) {
        console.warn('[GeminiService] Warning: No active Gemini AI integration found in Database and no .env key.');
      }
      this.lastDbCheck = now;
    } catch (e) {
      console.error('[GeminiService] Failed to load key from DB:', e.message);
    }
  }

  /**
   * Generates text embeddings for a given input
   * @param {string|string[]} text - Text to embed
   * @returns {Promise<number[][]>} Array of vectors
   */
  async generateEmbeddings(text) {
    await this.ensureInitialized();
    try {
      const input = Array.isArray(text) ? text[0] : text;
      const response = await this.ai.models.embedContent({
        model: 'text-embedding-004',
        contents: input
      });
      if (response.embeddings) {
         return response.embeddings.map(e => e.values);
      }
      return [[]];
    } catch (error) {
      // Silencing the stack trace dump since RAG is an optional fallback.
      // ai.service.js will catch this and log a clean warning.
      throw new Error('Failed to generate embeddings from Gemini API');
    }
  }

  /**
   * Generate a chat response with optional tool definitions
   */
  async generateChatResponse(messages, tools = [], systemInstruction = '') {
    await this.ensureInitialized();
    try {
      // Map generic message history to Gemini format
      const contents = messages.map(msg => {
        if (msg.role === 'user') {
          return { role: 'user', parts: [{ text: msg.content }] };
        } else if (msg.role === 'function') {
          return { role: 'user', parts: [{ functionResponse: { name: msg.name || 'tool', response: typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content } }] };
        } else if (msg.role === 'model' && msg.name) {
          return { role: 'model', parts: [{ functionCall: { name: msg.name, args: {} } }] };
        } else {
          return { role: 'model', parts: [{ text: msg.content }] };
        }
      });

      const config = {};
      if (systemInstruction) {
        config.systemInstruction = { parts: [{ text: systemInstruction }] };
      }
      
      if (tools.length > 0) {
        config.tools = [{ functionDeclarations: tools }];
      }

      const response = await this.ai.models.generateContent({
        model: this.chatModel,
        contents: contents,
        config
      });

      return response;
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      throw new Error('Failed to generate chat response from Gemini API');
    }
  }
}

module.exports = new GeminiService();
