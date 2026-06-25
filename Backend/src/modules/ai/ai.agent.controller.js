const AIAgentState = require('./models/AIAgentState');
const AIAuditLog = require('./models/AIAuditLog');
const AIAgentTask = require('./models/AIAgentTask');

exports.getAgentStatus = async (req, res) => {
  try {
    const agents = await AIAgentState.find({});
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AIAuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const tasks = await AIAgentTask.find({ status: 'ACTION_REQUIRED' }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.approveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await AIAgentTask.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // In production, execute the specific action here based on taskType
    
    task.status = 'COMPLETED';
    task.adminApproved = true;
    task.approvedBy = req.user.id;
    task.completedAt = new Date();
    await task.save();

    res.json({ message: 'Task approved successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
