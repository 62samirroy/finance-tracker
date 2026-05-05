import { AppDataSource } from "../data-source";
import { Account } from "../entities/Account";

class AccountService {
  private accountRepository = AppDataSource.getRepository(Account);

  async getAllAccounts(userId: number) {
    return await this.accountRepository.find({ 
      where: { user: { id: userId } },
      order: { id: "ASC" } 
    });
  }

  async getAccountById(id: number, userId: number) {
    return await this.accountRepository.findOneBy({ 
      id, 
      user: { id: userId } 
    });
  }

  async updateBalance(id: number, balance: number, userId: number) {
    const account = await this.getAccountById(id, userId);
    if (!account) throw new Error("Account not found");
    account.balance = balance;
    return await this.accountRepository.save(account);
  }

  async adjustBalance(id: number | undefined | null, amount: number, manager?: any) {
    if (!id) return;
    const repo = manager ? manager.getRepository(Account) : this.accountRepository;
    const account = await repo.findOneBy({ id });
    if (account) {
      account.balance = Number(account.balance) + amount;
      await repo.save(account);
    }
  }
}

export default new AccountService();
