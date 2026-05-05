import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Transaction } from "./Transaction";
import { Budget } from "./Budget";
import { User } from "./User";

@Entity("accounts")
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  balance!: number;

  @ManyToOne(() => User)
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.sourceAccount)
  sourceTransactions!: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.destinationAccount)
  destinationTransactions!: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.withdrawnFromAccount)
  budgets!: Budget[];
}
