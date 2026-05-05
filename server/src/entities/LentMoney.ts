import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("lent_money")
export class LentMoney {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  person_name!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount!: number;

  @Column({ default: "lent" })
  type!: string; // 'lent' or 'borrowed'

  @Column({ default: "pending" })
  status!: string; // 'pending' or 'repaid'

  @Column({ type: "date" })
  date!: string;

  @Column({ type: "date", nullable: true })
  repaid_date?: string;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  created_at!: Date;
}
