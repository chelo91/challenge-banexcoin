import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Account } from "./account.entity";

export enum UserType {
    USER = 0,
    WORKER = 1,
    ADMIN = 2
}

export enum UserStatus {
    DISABLED = 0,
    ENABLED = 1
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: "first_name" })
    firstName: string;

    @Column({ name: "last_name" })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: "hashed_password" })
    hashedPassword: string;

    @Column({
        type: "smallint",
        default: UserType.USER
    })
    type: UserType;

    @Column({
        type: "smallint",
        default: UserStatus.ENABLED
    })
    status: UserStatus;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt: Date;

    @OneToMany(() => Account, account => account.user)
    accounts: Account[];
} 