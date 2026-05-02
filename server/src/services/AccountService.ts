import { AppDataSource } from "../data-source";
import { Account } from "../entities/Account";

class AccountService {
  private accountRepository = AppDataSource.getRepository(Account);

  async getAllAccounts() {
    return await this.accountRepository.find({ order: { id: "ASC" } });
  }

  async getAccountById(id: number) {
    return await this.accountRepository.findOneBy({ id });
  }

  async updateBalance(id: number, balance: number) {
    await this.accountRepository.update(id, { balance });
    return await this.getAccountById(id);
  }

  async adjustBalance(id: number | undefined, amount: number) {
    if (!id) return;
    const account = await this.getAccountById(id);
    if (account) {
      account.balance = Number(account.balance) + amount;
      await this.accountRepository.save(account);
    }
  }
}

export default new AccountService();
