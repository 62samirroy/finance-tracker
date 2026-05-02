import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Account } from "./Account";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount!: number;

  @Column()
  type!: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  source_account_id?: number;

  @Column({ nullable: true })
  destination_account_id?: number;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  date!: Date;

  @ManyToOne(() => Account, (account) => account.sourceTransactions)
  @JoinColumn({ name: "source_account_id" })
  sourceAccount?: Account;

  @ManyToOne(() => Account, (account) => account.destinationTransactions)
  @JoinColumn({ name: "destination_account_id" })
  destinationAccount?: Account;
}
