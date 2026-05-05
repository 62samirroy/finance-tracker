import { AppDataSource } from "../data-source";
import { UpcomingExpense } from "../entities/UpcomingExpense";

class UpcomingExpenseService {
  private get repo() {
    return AppDataSource.getRepository(UpcomingExpense);
  }

  async getAll() {
    return await this.repo.find({
      order: { expected_date: "ASC" }
    });
  }

  async create(data: any) {
    const expense = this.repo.create(data);
    return await this.repo.save(expense);
  }

  async update(id: number, data: any) {
    await this.repo.update(id, data);
    return await this.repo.findOneBy({ id });
  }

  async delete(id: number) {
    return await this.repo.delete(id);
  }
}

export default new UpcomingExpenseService();
