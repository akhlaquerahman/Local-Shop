const { QdrantClient } = require('@qdrant/js-client-rest');

class QdrantService {
  constructor() {
    // Connect to local docker instance by default, or cloud if provided in env
    const url = process.env.QDRANT_URL || 'http://localhost:6333';
    const apiKey = process.env.QDRANT_API_KEY || '';
    
    this.client = new QdrantClient({ url, apiKey });
  }

  /**
   * Ensure a collection exists. Creates it if it doesn't.
   * We use size: 768 for Gemini embeddings.
   */
  async ensureCollection(collectionName, vectorSize = 768) {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === collectionName);
      
      if (!exists) {
        await this.client.createCollection(collectionName, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine'
          }
        });
        console.log(`Qdrant: Created collection ${collectionName}`);
      }
    } catch (error) {
      console.error(`Qdrant: Failed to ensure collection ${collectionName}`, error);
      // Don't throw fatal error yet, might be transient
    }
  }

  /**
   * Upsert vectors into a collection
   * @param {string} collectionName 
   * @param {Array<{id: string, vector: number[], payload: object}>} points 
   */
  async upsertPoints(collectionName, points) {
    try {
      await this.ensureCollection(collectionName);
      await this.client.upsert(collectionName, {
        wait: true,
        points: points
      });
      return true;
    } catch (error) {
      console.error(`Qdrant: Failed to upsert points to ${collectionName}`, error);
      throw error;
    }
  }

  /**
   * Search for similar vectors
   */
  async search(collectionName, queryVector, limit = 5, filter = null) {
    try {
      const searchParams = {
        vector: queryVector,
        limit: limit,
        with_payload: true
      };
      
      if (filter) {
        searchParams.filter = filter;
      }
      
      return await this.client.search(collectionName, searchParams);
    } catch (error) {
      console.error(`Qdrant: Search failed on ${collectionName}`, error);
      return [];
    }
  }

  /**
   * Delete points belonging to a specific document
   */
  async deleteDocumentPoints(collectionName, documentId) {
    try {
      await this.client.delete(collectionName, {
        filter: {
          must: [
            { key: 'documentId', match: { value: documentId } }
          ]
        }
      });
      return true;
    } catch (error) {
      console.error(`Qdrant: Failed to delete points for document ${documentId}`, error);
      return false;
    }
  }
}

module.exports = new QdrantService();
