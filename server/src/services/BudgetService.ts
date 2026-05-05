import { AppDataSource } from "../data-source";
import { Budget } from "../entities/Budget";

class BudgetService {
  private budgetRepository = AppDataSource.getRepository(Budget);

  async getBudgetByMonth(month: string, userId: number) {
    return await this.budgetRepository.findOneBy({ 
      month, 
      user: { id: userId } 
    });
  }

  async setBudget(data: { month: string; amount: number; withdrawn_from_account_id?: number }, userId: number) {
    const { month, amount, withdrawn_from_account_id } = data;
    
    let budget = await this.getBudgetByMonth(month, userId);
    if (budget) {
      budget.amount = amount;
      budget.withdrawn_from_account_id = withdrawn_from_account_id;
    } else {
      budget = this.budgetRepository.create({
        month,
        amount,
        withdrawn_from_account_id,
        user: { id: userId }
      });
    }

    return await this.budgetRepository.save(budget);
  }
}

export default new BudgetService();
