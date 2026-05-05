import { AppDataSource } from "../data-source";
import { UpcomingExpense } from "../entities/UpcomingExpense";

class UpcomingExpenseService {
  private repository = AppDataSource.getRepository(UpcomingExpense);

  async getAll(userId: number) {
    return await this.repository.find({
      where: { user: { id: userId } },
      order: { expected_date: "ASC" }
    });
  }

  async create(data: any, userId: number) {
    const expense = this.repository.create({ ...data, user: { id: userId } });
    return await this.repository.save(expense);
  }

  async update(id: number, data: any, userId: number) {
    const expense = await this.repository.findOneBy({ id, user: { id: userId } });
    if (!expense) throw new Error("Upcoming expense not found");
    Object.assign(expense, data);
    return await this.repository.save(expense);
  }

  async delete(id: number, userId: number) {
    const expense = await this.repository.findOneBy({ id, user: { id: userId } });
    if (!expense) throw new Error("Upcoming expense not found");
    return await this.repository.remove(expense);
  }
}

export default new UpcomingExpenseService();
