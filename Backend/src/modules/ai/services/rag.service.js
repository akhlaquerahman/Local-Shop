const pdfParse = require('pdf-parse');
const crypto = require('crypto');
const qdrantService = require('./qdrant.service');
const geminiService = require('./gemini.service');
const AIKnowledgeDocument = require('../models/AIKnowledgeDocument');

class RagService {
  
  /**
   * Process an uploaded file, chunk it, embed it, and store in Qdrant
   */
  async processDocument(file, metadata, uploadedBy) {
    // 1. Create DB Record
    const doc = await AIKnowledgeDocument.create({
      title: metadata.title || file.originalname,
      filename: file.originalname,
      fileType: this.getFileType(file.mimetype, file.originalname),
      fileSize: file.size,
      uploadedBy: uploadedBy,
      qdrantCollection: metadata.collection || 'Admin_Knowledge',
      status: 'PROCESSING'
    });

    try {
      // 2. Extract Text
      const text = await this.extractText(file);
      
      // 3. Chunk Text
      const chunks = this.chunkText(text, 1000, 200);
      doc.chunkCount = chunks.length;
      await doc.save();

      // 4. Generate Embeddings (batch them to avoid API limits)
      const points = [];
      const batchSize = 10;
      
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batchChunks = chunks.slice(i, i + batchSize);
        const embeddings = await geminiService.generateEmbeddings(batchChunks);
        
        batchChunks.forEach((chunkText, idx) => {
          points.push({
            id: crypto.randomUUID(),
            vector: embeddings[idx],
            payload: {
              documentId: doc._id.toString(),
              title: doc.title,
              text: chunkText,
              chunkIndex: i + idx
            }
          });
        });
      }

      // 5. Upsert to Qdrant
      await qdrantService.upsertPoints(doc.qdrantCollection, points);

      // 6. Mark Success
      doc.status = 'INDEXED';
      await doc.save();
      
      return doc;
    } catch (error) {
      console.error('RAG Processing Error:', error);
      doc.status = 'FAILED';
      doc.errorMessage = error.message;
      await doc.save();
      throw error;
    }
  }

  getFileType(mimeType, filename) {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType === 'text/plain') return 'TXT';
    if (filename.endsWith('.md')) return 'MARKDOWN';
    return 'TXT'; // fallback
  }

  async extractText(file) {
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      return data.text;
    } else {
      // For TXT or Markdown
      return file.buffer.toString('utf8');
    }
  }

  /**
   * Simple character-based text chunking with overlap
   */
  chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + chunkSize));
      i += chunkSize - overlap;
    }
    return chunks;
  }
}

module.exports = new RagService();
