import { AppDataSource } from "../data-source";
import { LentMoney } from "../entities/LentMoney";

class LentMoneyService {
  private get repo() {
    return AppDataSource.getRepository(LentMoney);
  }

  async getAll() {
    return await this.repo.find({
      order: { date: "DESC" }
    });
  }

  async create(data: any) {
    const record = this.repo.create(data);
    return await this.repo.save(record);
  }

  async update(id: number, data: any) {
    await this.repo.update(id, data);
    return await this.repo.findOneBy({ id });
  }

  async delete(id: number) {
    return await this.repo.delete(id);
  }
}

export default new LentMoneyService();
