const db = require('../db');

class AccountService {
  async getAllAccounts() {
    const result = await db.query('SELECT * FROM accounts ORDER BY id ASC');
    return result.rows;
  }

  async getAccountById(id) {
    const result = await db.query('SELECT * FROM accounts WHERE id = $1', [id]);
    return result.rows[0];
  }

  async updateBalance(id, balance) {
    const result = await db.query(
      'UPDATE accounts SET balance = $1 WHERE id = $2 RETURNING *',
      [balance, id]
    );
    return result.rows[0];
  }

  async adjustBalance(id, amount) {
    if (!id) return;
    await db.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, id]);
  }
}

module.exports = new AccountService();
