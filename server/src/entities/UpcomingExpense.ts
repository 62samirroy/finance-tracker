import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("upcoming_expenses")
export class UpcomingExpense {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount!: number;

  @Column()
  category!: string;

  @Column({ nullable: true })
  note?: string;

  @Column({ type: "date" })
  expected_date!: string;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User)
  user!: User;
}
