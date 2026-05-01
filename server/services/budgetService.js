const db = require('../db');

class BudgetService {
  async getBudgetByMonth(month) {
    const result = await db.query('SELECT * FROM budgets WHERE month = $1', [month]);
    return result.rows[0] || null;
  }

  async setBudget(data) {
    const { month, amount, withdrawn_from_account_id } = data;
    const result = await db.query(
      'INSERT INTO budgets (month, amount, withdrawn_from_account_id) VALUES ($1, $2, $3) ON CONFLICT (month) DO UPDATE SET amount = EXCLUDED.amount, withdrawn_from_account_id = EXCLUDED.withdrawn_from_account_id RETURNING *',
      [month, amount, withdrawn_from_account_id]
    );
    return result.rows[0];
  }
}

module.exports = new BudgetService();
