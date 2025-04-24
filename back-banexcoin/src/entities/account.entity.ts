import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { Transaction } from "./transaction.entity";
import { Commission } from "./commission.entity";

export enum AccountStatus {
    DISABLED = 0,
    ENABLED = 1
}

@Entity("accounts")
export class Account {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: "user_id", type: "uuid" })
    userId: string;

    @Column({ name: "balance", type: "decimal", precision: 12, scale: 2, default: 0 })
    balance: number;

    @Column({ name: "balance_pending", type: "decimal", precision: 12, scale: 2, default: 0 })
    balancePending: number;

    @Column({ name: "currency", type: "varchar", length: 3, default: "USD" })
    currency: string;

    @Column({ name: "referrer_account_id", type: "uuid", nullable: true })
    referrerAccountId: string;

    @Column({
        type: "smallint",
        default: AccountStatus.ENABLED
    })
    status: AccountStatus;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt: Date;

    @ManyToOne(() => User, user => user.accounts)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Account, account => account.referrals)
    @JoinColumn({ name: "referrer_account_id" })
    referrer: Account | null;

    @OneToMany(() => Account, account => account.referrer)
    referrals: Account[];

    @OneToMany(() => Transaction, transaction => transaction.accountOrigin, { cascade: true })
    transactionsOrigin: Transaction[];

    @OneToMany(() => Transaction, transaction => transaction.accountDestination, { cascade: true })
    transactionsDestination: Transaction[];

    @OneToMany(() => Commission, commission => commission.beneficiary)
    commissions: Commission[];
} 