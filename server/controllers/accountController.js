const accountService = require('../services/accountService');

exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.json(accounts);
  } catch (err) {
     console.error("🔥 ERROR getAllAccounts:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  const { id } = req.params;
  const { balance } = req.body;
  try {
    const account = await accountService.updateBalance(id, balance);
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
