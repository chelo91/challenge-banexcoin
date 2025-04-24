import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Transaction } from "./transaction.entity";
import { Account } from "./account.entity";

export enum CommissionStatus {
    DISABLED = 0,
    ENABLED = 1
}

@Entity("commissions")
export class Commission {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: "transaction_id", type: "uuid" })
    transactionId: string;

    @Column({ name: "beneficiary_id", type: "uuid" })
    beneficiaryId: string;

    @Column({ type: "decimal", precision: 12, scale: 2 })
    amount: number;

    @Column({ name: "currency", type: "varchar", length: 3, default: "USD" })
    currency: string;

    @Column({
        type: "smallint",
        default: CommissionStatus.DISABLED
    })
    status: CommissionStatus;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt: Date;

    @ManyToOne(() => Transaction, transaction => transaction.commissions)
    @JoinColumn({ name: "transaction_id" })
    transaction: Transaction;

    @ManyToOne(() => Account, account => account.commissions)
    @JoinColumn({ name: "beneficiary_id" })
    beneficiary: Account;
} 