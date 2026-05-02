import { AppDataSource } from "../data-source";
import { Transaction } from "../entities/Transaction";
import accountService from "./AccountService";
import { Like } from "typeorm";

class TransactionService {
  private transactionRepository = AppDataSource.getRepository(Transaction);

  async getTransactions({ type, month }: { type?: string; month?: string }) {
    const where: any = {};
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

  async createTransaction(data: any) {
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
        date: date ? new Date(date) : new Date()
      } as Partial<Transaction>);

      const savedTransaction = await queryRunner.manager.save(transaction);
      await this.applyBalanceEffect(savedTransaction);

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateTransaction(id: number, data: any) {
    const { amount, type, category, source_account_id, destination_account_id, note, date } = data;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const old = await this.transactionRepository.findOneBy({ id });
      if (!old) throw new Error('Transaction not found');

      await this.reverseBalanceEffect(old);

      old.amount = amount;
      old.type = type;
      old.category = category;
      old.source_account_id = source_account_id ? Number(source_account_id) : undefined;
      old.destination_account_id = destination_account_id ? Number(destination_account_id) : undefined;
      old.note = note;
      old.date = date ? new Date(date) : old.date;

      const updated = await queryRunner.manager.save(old);
      await this.applyBalanceEffect(updated);

      await queryRunner.commitTransaction();
      return updated;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteTransaction(id: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const old = await this.transactionRepository.findOneBy({ id });
      if (!old) throw new Error('Transaction not found');

      await this.reverseBalanceEffect(old);
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

  async applyBalanceEffect(t: Transaction) {
    const amount = Number(t.amount);
    if (t.type === 'salary') {
      await accountService.adjustBalance(t.destination_account_id, amount);
    } else if (t.type === 'transfer' || t.type === 'self_transfer') {
      await accountService.adjustBalance(t.source_account_id, -amount);
      await accountService.adjustBalance(t.destination_account_id, amount);
    } else if (t.type === 'expense' || t.type === 'emi' || t.type === 'budget_withdraw') {
      await accountService.adjustBalance(t.source_account_id, -amount);
    }
  }

  async reverseBalanceEffect(t: Transaction) {
    const amount = Number(t.amount);
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

export default new TransactionService();
