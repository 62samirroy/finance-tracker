const transactionService = require('../services/transactionService');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getTransactions(req.query);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.createTransaction(req.body);
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.updateTransaction(req.params.id, req.body);
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const result = await transactionService.deleteTransaction(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearAllData = async (req, res) => {
  try {
    const result = await transactionService.clearAllData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
