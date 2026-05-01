const budgetService = require('../services/budgetService');

exports.getBudget = async (req, res) => {
  try {
    const budget = await budgetService.getBudgetByMonth(req.params.month);
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setBudget = async (req, res) => {
  try {
    const budget = await budgetService.setBudget(req.body);
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
