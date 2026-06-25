const geminiService = require('./gemini.service');
const qdrantService = require('./qdrant.service');
const { ToolDeclarations, AIToolsExecutor } = require('./ai.tools');
const AIChatSession = require('../models/AIChatSession');
const AIMemory = require('../models/AIMemory');
const AIUsageLog = require('../models/AIUsageLog');

class AiService {
  
  async handleChat(userId, userRole, sessionId, message, pageContext = {}) {
    // 1. Get or Create Session
    let session = await AIChatSession.findOne({ sessionId, userId });
    if (!session) {
      session = await AIChatSession.create({ userId, userRole, sessionId });
    }

    if (message === '_INIT_CHAT_') {
      // Instead of an LLM query, we can pre-fetch some stats and return a formatted message directly to save latency,
      // or we can instruct the LLM. Instructing the LLM is better for dynamic responses.
      message = "I have just opened the chat. Please greet me by my name and provide a 'Smart Home Message' summarizing my key stats. Use your tools to fetch my recent orders, wallet balance, or any relevant data for my role. Keep it brief, friendly, and use bullet points.";
    } else if (session.title === 'New Conversation' && session.messages.length <= 2) {
      try {
        const titlePrompt = `Generate a very short, concise title (2 to 4 words max) for a conversation that starts with: "${message}". Do not include quotes or punctuation. Make it descriptive like "Track Order" or "Wallet Balance Inquiry".`;
        const titleResponse = await geminiService.generateChatResponse([{ role: 'user', content: titlePrompt }]);
        let newTitle = '';
        try { newTitle = typeof titleResponse.text === 'function' ? titleResponse.text() : titleResponse.text; } catch (e) {}
        if (newTitle) {
          session.title = newTitle.trim().replace(/^["']|["']$/g, '');
        } else {
          throw new Error('Empty text');
        }
      } catch (e) {
        const words = message.split(' ').slice(0, 4).join(' ');
        session.title = words.length > 0 ? (words.charAt(0).toUpperCase() + words.slice(1)) : 'New Conversation';
      }
      await session.save();
    }

    // 2. Fetch Persistent User Memory
    let memory = await AIMemory.findOne({ userId, role: userRole });
    if (!memory) {
      memory = await AIMemory.create({ userId, role: userRole });
    }

    // 3. Perform RAG (Vector Search)
    const contextText = await this.performRAG(message, userRole);

    // Fetch full User context
    const User = require('../../../models/User');
    const userDoc = await User.findById(userId).lean() || {};
    const userInfo = `
    Name: ${userDoc.name || 'Unknown'}
    Email: ${userDoc.email || 'Unknown'}
    Phone: ${userDoc.phone || 'Unknown'}
    City: ${userDoc.address?.city || 'Unknown'}
    Permissions: ${JSON.stringify(userDoc.permissions || [])}
    `;

    // 4. Build System Prompt & History
    const systemInstruction = `You are a highly capable, operational AI Assistant for a Local Shop Marketplace.
    You are talking to a user with role: ${userRole}. 
    User Details:
    ${userInfo}
    The user is currently on the following page route: ${pageContext.pathname || 'unknown'}.
    
    User Memory & Preferences:
    Active Workflows: ${JSON.stringify(memory.activeWorkflows)}
    Recent Entities: ${JSON.stringify(memory.recentEntities)}

    CRITICAL RULES:
    1. You HAVE FULL ACCESS to the database through your tools. NEVER say you "cannot access data", "do not have access", or "are an AI". You MUST call the appropriate tool to fetch the requested data.
    2. NEVER hallucinate data. ALWAYS use real database data by calling your tools.
    3. If the user asks contextual questions (e.g., "this order", "my email", "my profile"), rely on the user details provided or call the relevant tool.
    4. When a tool returns a \`_type\` field, wrap its exact output in a markdown \`\`\`json-action\`\`\` block.
    5. When a tool like \`queryDatabase\` returns generic data WITHOUT a \`_type\` field, you MUST format and present that data directly to the user as a clear markdown list or table. Do NOT output empty responses. Do NOT hide the data.
    6. Always be concise.
    7. When a tool returns an \`error\` field, explain the failure elegantly using the error reason.
    
    Context from Knowledge Base:
    ${contextText}
    `;

    const chatHistory = [...session.messages, { role: 'user', content: message }];

    // 4. Call Gemini
    const startTime = Date.now();
    let responseText = '';
    let tokensUsed = 0;

    try {
      // First pass
      const result = await geminiService.generateChatResponse(chatHistory, ToolDeclarations, systemInstruction);
      const call = result.functionCalls && result.functionCalls.length > 0 ? result.functionCalls[0] : null;

      if (call) {
        // Tool was requested by LLM
        const toolResult = await AIToolsExecutor.execute(call, userRole, userId);
        
        // Feed tool result back to LLM
        chatHistory.push({ role: 'model', name: call.name }); 
        chatHistory.push({ role: 'function', name: call.name, content: JSON.stringify(toolResult) });

        const finalResult = await geminiService.generateChatResponse(chatHistory, [], systemInstruction);
        let textValue = '';
        try { textValue = typeof finalResult.text === 'function' ? finalResult.text() : finalResult.text; } catch (e) {}
        responseText = textValue || 'Action completed.';
      } else {
        let textValue = '';
        try { textValue = typeof result.text === 'function' ? result.text() : result.text; } catch (e) {}
        responseText = textValue || 'Action completed.';
      }

      // 5. Save Messages
      session.messages.push({ role: 'user', content: message });
      session.messages.push({ role: 'model', content: responseText });
      await session.save();

      // 6. Log Usage (Estimating tokens for demo)
      await AIUsageLog.create({
        userId, userRole,
        totalTokens: message.length + responseText.length, 
        responseTimeMs: Date.now() - startTime
      });

      return responseText;
    } catch (error) {
      console.error('AI Service Error:', error);
      await AIUsageLog.create({
        userId, userRole, isSuccessful: false, responseTimeMs: Date.now() - startTime
      });
      throw error;
    }
  }

  async performRAG(message, role) {
    try {
      const qdrantCollection = role === 'SUPER_ADMIN' ? 'Admin_Knowledge' : 'General_Knowledge';
      const vector = await geminiService.generateEmbeddings(message);
      const searchResults = await qdrantService.search(qdrantCollection, vector[0], 3);
      
      if (searchResults.length > 0) {
        return searchResults.map(r => r.payload.text).join('\n\n');
      }
      return '';
    } catch (e) {
      console.warn('RAG Search failed or skipped', e.message);
      return '';
    }
  }
}

module.exports = new AiService();
