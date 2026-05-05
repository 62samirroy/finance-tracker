import { AppDataSource } from "../data-source";
import { UpcomingExpense } from "../entities/UpcomingExpense";

class UpcomingExpenseService {
  private repository = AppDataSource.getRepository(UpcomingExpense);

  async getAll() {
    return await this.repository.find({
      order: { expected_date: "ASC" }
    });
  }

  async create(data: any) {
    const expense = this.repository.create(data);
    return await this.repository.save(expense);
  }

  async update(id: number, data: any) {
    await this.repository.update(id, data);
    return await this.repository.findOneBy({ id });
  }

  async delete(id: number) {
    return await this.repository.delete(id);
  }
}

export default new UpcomingExpenseService();
