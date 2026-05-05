import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Account } from "./Account";

@Entity("budgets")
export class Budget {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  month!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount!: number;

  @Column({ nullable: true })
  withdrawn_from_account_id?: number;

  @ManyToOne(() => Account, (account) => account.budgets)
  @JoinColumn({ name: "withdrawn_from_account_id" })
  withdrawnFromAccount?: Account;
}
