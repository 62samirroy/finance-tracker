import { AppDataSource } from "../data-source";
import { Budget } from "../entities/Budget";

class BudgetService {
  private get repo() {
    return AppDataSource.getRepository(Budget);
  }

  async getBudgetByMonth(month: string) {
    return await this.repo.findOneBy({ month });
  }

  async setBudget(data: { month: string; amount: number; withdrawn_from_account_id?: number }) {
    const { month, amount, withdrawn_from_account_id } = data;
    
    let budget = await this.getBudgetByMonth(month);
    if (budget) {
      budget.amount = amount;
      budget.withdrawn_from_account_id = withdrawn_from_account_id;
    } else {
      budget = this.repo.create({
        month,
        amount,
        withdrawn_from_account_id
      });
    }

    return await this.repo.save(budget);
  }
}

export default new BudgetService();
