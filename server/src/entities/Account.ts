import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Transaction } from "./Transaction";
import { Budget } from "./Budget";

@Entity("accounts")
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  balance!: number;

  @OneToMany(() => Transaction, (transaction) => transaction.sourceAccount)
  sourceTransactions!: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.destinationAccount)
  destinationTransactions!: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.withdrawnFromAccount)
  budgets!: Budget[];
}
