import { AppDataSource } from "../data-source";
import { LentMoney } from "../entities/LentMoney";

class LentMoneyService {
  private repository = AppDataSource.getRepository(LentMoney);

  async getAll(userId: number) {
    return await this.repository.find({
      where: { user: { id: userId } },
      order: { date: "DESC" }
    });
  }

  async create(data: any, userId: number) {
    const record = this.repository.create({ ...data, user: { id: userId } });
    return await this.repository.save(record);
  }

  async update(id: number, data: any, userId: number) {
    const record = await this.repository.findOneBy({ id, user: { id: userId } });
    if (!record) throw new Error("Lent money record not found");
    Object.assign(record, data);
    return await this.repository.save(record);
  }

  async delete(id: number, userId: number) {
    const record = await this.repository.findOneBy({ id, user: { id: userId } });
    if (!record) throw new Error("Lent money record not found");
    return await this.repository.remove(record);
  }
}

export default new LentMoneyService();
