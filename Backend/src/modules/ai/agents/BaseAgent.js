const AIAgentState = require('../models/AIAgentState');
const AIAuditLog = require('../models/AIAuditLog');
const AIAgentTask = require('../models/AIAgentTask');

class BaseAgent {
  constructor(agentId, name) {
    this.agentId = agentId;
    this.name = name;
    this.tokenLimit = 50000; // Hard daily limit
  }

  async initialize() {
    await AIAgentState.findOneAndUpdate(
      { agentId: this.agentId },
      { $setOnInsert: { name: this.name, status: 'ONLINE' } },
      { upsert: true }
    );
    // console.log(`[Agent: ${this.name}] Initialized`);
  }

  async logExecution(actionType, prompt, response, tokensUsed, executionTimeMs, status, errorMessage = null) {
    await AIAuditLog.create({
      agentId: this.agentId,
      actionType,
      prompt,
      response,
      tokensUsed,
      executionTimeMs,
      status,
      errorMessage
    });

    if (status === 'SUCCESS') {
      await AIAgentState.updateOne(
        { agentId: this.agentId },
        { 
          $inc: { totalRuns: 1, totalTokensUsed: tokensUsed },
          $set: { lastRunAt: new Date(), status: 'ONLINE' }
        }
      );
    } else {
      await AIAgentState.updateOne(
        { agentId: this.agentId },
        { 
          $inc: { totalRuns: 1, failedRuns: 1 },
          $set: { lastRunAt: new Date(), status: 'ERROR' }
        }
      );
    }
  }

  async requestApproval(taskType, payload, result) {
    const task = await AIAgentTask.create({
      agentId: this.agentId,
      taskType,
      payload,
      result,
      status: 'ACTION_REQUIRED',
      requiresAdminApproval: true
    });
    console.log(`[Agent: ${this.name}] Requested Admin Approval for task ${task._id}`);
    return task;
  }
}

module.exports = BaseAgent;
