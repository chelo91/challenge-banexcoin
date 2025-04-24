import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Account } from "./account.entity";
import { Commission } from "./commission.entity";

export enum TransactionType {
    USER_TO_USER = 0,
    REFERRAL_COMMISSION = 1,
    PLATFORM_FEE = 2,
    MANUAL_ADJUSTMENT = 3
}

export enum TransactionStatus {
    PENDING = 0,
    APPROVED = 1,
    CANCELLED = 2
}

@Entity("transactions")
export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: "group_transaction_id", type: "uuid", nullable: false })
    groupTransactionId: string;

    @Column({ name: "account_origin_id", type: "uuid", nullable: true })
    accountOriginId: string | null;

    @Column({ name: "account_destination_id", type: "uuid", nullable: true })
    accountDestinationId: string | null;

    @Column({ type: "decimal", precision: 12, scale: 2 })
    amount: number;

    @Column({ name: "currency", type: "varchar", length: 3, default: "USD" })
    currency: string;

    @Column({ name: "transaction_fee", type: "decimal", precision: 12, scale: 2 })
    transactionFee: number;

    @Column({
        type: "smallint",
        default: TransactionType.USER_TO_USER
    })
    type: TransactionType;

    @Column({
        type: "smallint",
        default: TransactionStatus.PENDING
    })
    status: TransactionStatus;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt: Date;

    @ManyToOne(() => Account, account => account.transactionsOrigin)
    @JoinColumn({ name: "account_origin_id" })
    accountOrigin: Account | null;

    @ManyToOne(() => Account, account => account.transactionsDestination)
    @JoinColumn({ name: "account_destination_id" })
    accountDestination: Account | null;

    @OneToMany(() => Commission, commission => commission.transaction)
    commissions: Commission[];
} 