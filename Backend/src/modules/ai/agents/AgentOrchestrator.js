const cron = require('node-cron');
const FraudAgent = require('./FraudAgent');
const EventEmitter = require('events');

class AgentOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.agents = [FraudAgent]; // Add others here
  }

  async initializeAgents() {
    // console.log('[AgentOrchestrator] Initializing AI Workforce...');
    for (const agent of this.agents) {
      await agent.initialize();
    }
  }

  startScheduledTasks() {
    // console.log('[AgentOrchestrator] Starting Cron Scheduler...');
    
    // Fraud Agent runs every hour at minute 0
    cron.schedule('0 * * * *', () => {
      FraudAgent.runDailyScan();
    });

    // In a real scenario, you would schedule other agents here
    // e.g. CatalogAgent runs at 2 AM
    // cron.schedule('0 2 * * *', () => CatalogAgent.scanProducts());
  }
}

module.exports = new AgentOrchestrator();
