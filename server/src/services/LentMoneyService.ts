import { AppDataSource } from "../data-source";
import { LentMoney } from "../entities/LentMoney";

class LentMoneyService {
  private repository = AppDataSource.getRepository(LentMoney);

  async getAll() {
    return await this.repository.find({
      order: { date: "DESC" }
    });
  }

  async create(data: any) {
    const record = this.repository.create(data);
    return await this.repository.save(record);
  }

  async update(id: number, data: any) {
    await this.repository.update(id, data);
    return await this.repository.findOneBy({ id });
  }

  async delete(id: number) {
    return await this.repository.delete(id);
  }
}

export default new LentMoneyService();
