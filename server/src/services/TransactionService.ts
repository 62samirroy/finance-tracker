import { AppDataSource } from "../data-source";
import { Transaction } from "../entities/Transaction";
import accountService from "./AccountService";
import { Like } from "typeorm";

class TransactionService {
  private transactionRepository = AppDataSource.getRepository(Transaction);

  async getTransactions({ type, month, userId }: { type?: string; month?: string; userId: number }) {
    const where: any = { user: { id: userId } };
    if (type && type !== 'all') {
      where.type = type;
    }
    if (month) {
      where.date = Like(`${month}%`);
    }

    return await this.transactionRepository.find({
      where,
      order: { date: "DESC", id: "DESC" },
      relations: ["sourceAccount", "destinationAccount"]
    });
  }

  async createTransaction(data: any, userId: number) {
    const { amount, type, category, source_account_id, destination_account_id, note, date } = data;
    
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = this.transactionRepository.create({
        amount,
        type,
        category,
        source_account_id: source_account_id ? Number(source_account_id) : undefined,
        destination_account_id: destination_account_id ? Number(destination_account_id) : undefined,
        note,
        date: date ? new Date(date) : new Date(),
        user: { id: userId }
      } as Partial<Transaction>);

      const savedTransaction = await queryRunner.manager.save(transaction);
      await this.applyBalanceEffect(savedTransaction, queryRunner.manager);

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateTransaction(id: number, data: any, userId: number) {
    const { amount, type, category, source_account_id, destination_account_id, note, date } = data;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const old = await queryRunner.manager.findOne(Transaction, { 
        where: { id, user: { id: userId } } 
      });
      if (!old) throw new Error('Transaction not found');

      await this.reverseBalanceEffect(old, queryRunner.manager);

      old.amount = amount;
      old.type = type;
      old.category = category;
      old.source_account_id = source_account_id ? Number(source_account_id) : null;
      old.destination_account_id = destination_account_id ? Number(destination_account_id) : null;
      old.note = note;
      old.date = date ? new Date(date) : old.date;

      const updated = await queryRunner.manager.save(old);
      await this.applyBalanceEffect(updated, queryRunner.manager);

      await queryRunner.commitTransaction();
      return updated;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteTransaction(id: number, userId: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const old = await queryRunner.manager.findOne(Transaction, { 
        where: { id, user: { id: userId } } 
      });
      if (!old) throw new Error('Transaction not found');

      await this.reverseBalanceEffect(old, queryRunner.manager);
      await queryRunner.manager.remove(old);

      await queryRunner.commitTransaction();
      return { message: 'Deleted successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async applyBalanceEffect(t: Transaction, manager?: any) {
    const amount = Number(t.amount);
    if (t.type === 'salary' || t.type === 'received_money') {
      await accountService.adjustBalance(t.destination_account_id, amount, manager);
    } else if (t.type === 'transfer' || t.type === 'self_transfer') {
      await accountService.adjustBalance(t.source_account_id, -amount, manager);
      await accountService.adjustBalance(t.destination_account_id, amount, manager);
    } else if (t.type === 'expense' || t.type === 'emi' || t.type === 'budget_withdraw') {
      await accountService.adjustBalance(t.source_account_id, -amount, manager);
    }
  }


  async reverseBalanceEffect(t: Transaction, manager?: any) {
    const amount = Number(t.amount);
    if (t.type === 'salary' || t.type === 'received_money') {
      await accountService.adjustBalance(t.destination_account_id, -amount, manager);
    } else if (t.type === 'transfer' || t.type === 'self_transfer') {
      await accountService.adjustBalance(t.source_account_id, amount, manager);
      await accountService.adjustBalance(t.destination_account_id, -amount, manager);
    } else if (t.type === 'expense' || t.type === 'emi' || t.type === 'budget_withdraw') {
      await accountService.adjustBalance(t.source_account_id, amount, manager);
    }
  }
}

export default new TransactionService();
