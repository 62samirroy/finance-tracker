import { AppDataSource } from "../data-source";
import { Account } from "../entities/Account";

class AccountService {
  private get repo() {
    return AppDataSource.getRepository(Account);
  }

  async getAllAccounts() {
    return await this.repo.find({ order: { id: "ASC" } });
  }

  async getAccountById(id: number) {
    return await this.repo.findOneBy({ id });
  }

  async updateBalance(id: number, balance: number) {
    await this.repo.update(id, { balance });
    return await this.getAccountById(id);
  }

  async adjustBalance(id: number | undefined | null, amount: number, manager?: any) {
    if (!id) return;
    const repo = manager ? manager.getRepository(Account) : this.repo;
    const account = await repo.findOneBy({ id });
    if (account) {
      account.balance = Number(account.balance) + amount;
      await repo.save(account);
    }
  }
}

export default new AccountService();
