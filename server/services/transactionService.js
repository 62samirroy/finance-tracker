const db = require('../db');
const accountService = require('./accountService');

class TransactionService {
  async getTransactions({ type, month }) {
    let query = `
      SELECT t.*, s.name as source_name, d.name as destination_name 
      FROM transactions t
      LEFT JOIN accounts s ON t.source_account_id = s.id
      LEFT JOIN accounts d ON t.destination_account_id = d.id
    `;
    const params = [];
    const conditions = [];

    if (type && type !== 'all') {
      params.push(type);
      conditions.push(`t.type = $${params.length}`);
    }

    if (month) {
      params.push(`${month}%`);
      conditions.push(`t.date::text LIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.date DESC, t.id DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  async createTransaction(data) {
    const { amount, type, category, source_account_id, destination_account_id, note, date } = data;
    
    try {
      await db.query('BEGIN');

      const result = await db.query(
        'INSERT INTO transactions (amount, type, category, source_account_id, destination_account_id, note, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [amount, type, category, source_account_id, destination_account_id, note, date || new Date()]
      );
      const transaction = result.rows[0];

      await this.applyBalanceEffect(transaction);

      await db.query('COMMIT');
      return transaction;
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  }

  async updateTransaction(id, data) {
    const { amount, type, category, source_account_id, destination_account_id, note, date } = data;

    try {
      await db.query('BEGIN');

      const oldRes = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
      if (oldRes.rows.length === 0) throw new Error('Transaction not found');
      const old = oldRes.rows[0];

      // Reverse old effect
      await this.reverseBalanceEffect(old);

      // Update transaction record
      const updatedRes = await db.query(
        'UPDATE transactions SET amount = $1, type = $2, category = $3, source_account_id = $4, destination_account_id = $5, note = $6, date = $7 WHERE id = $8 RETURNING *',
        [amount, type, category, source_account_id, destination_account_id, note, date, id]
      );
      const updated = updatedRes.rows[0];

      // Apply new effect
      await this.applyBalanceEffect(updated);

      await db.query('COMMIT');
      return updated;
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  }

  async deleteTransaction(id) {
    try {
      await db.query('BEGIN');

      const oldRes = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
      if (oldRes.rows.length === 0) throw new Error('Transaction not found');
      const old = oldRes.rows[0];

      await this.reverseBalanceEffect(old);

      await db.query('DELETE FROM transactions WHERE id = $1', [id]);

      await db.query('COMMIT');
      return { message: 'Deleted successfully' };
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  }

  async clearAllData() {
    try {
      await db.query('BEGIN');
      await db.query('DELETE FROM transactions');
      await db.query('DELETE FROM budgets');
      await db.query('UPDATE accounts SET balance = 0');
      await db.query('COMMIT');
      return { message: 'All data cleared successfully' };
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  }

  async applyBalanceEffect(t) {
    const amount = parseFloat(t.amount);
    if (t.type === 'salary') {
      await accountService.adjustBalance(t.destination_account_id, amount);
    } else if (t.type === 'transfer' || t.type === 'self_transfer') {
      await accountService.adjustBalance(t.source_account_id, -amount);
      await accountService.adjustBalance(t.destination_account_id, amount);
    } else if (t.type === 'expense' || t.type === 'emi' || t.type === 'budget_withdraw') {
      await accountService.adjustBalance(t.source_account_id, -amount);
    }
  }

  async reverseBalanceEffect(t) {
    const amount = parseFloat(t.amount);
    if (t.type === 'salary') {
      await accountService.adjustBalance(t.destination_account_id, -amount);
    } else if (t.type === 'transfer' || t.type === 'self_transfer') {
      await accountService.adjustBalance(t.source_account_id, amount);
      await accountService.adjustBalance(t.destination_account_id, -amount);
    } else if (t.type === 'expense' || t.type === 'emi' || t.type === 'budget_withdraw') {
      await accountService.adjustBalance(t.source_account_id, amount);
    }
  }
}

module.exports = new TransactionService();
