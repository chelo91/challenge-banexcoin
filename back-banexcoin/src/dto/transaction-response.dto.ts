import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDTO } from './user.dto';

@Exclude()
export class AccountResponseDto {
    @Expose()
    id: string;

    @Expose()
    currency: string;

    @Expose()
    status: number;

    @Expose()
    @Type(() => UserResponseDTO)
    user: UserResponseDTO;

    constructor(partial: Partial<AccountResponseDto>) {
        Object.assign(this, partial);
    }
}

@Exclude()
export class TransactionResponseDto {
    @Expose()
    id: string;

    @Expose()
    amount: number;

    @Expose()
    currency: string;

    @Expose()
    transactionFee: number;

    @Expose()
    type: number;

    @Expose()
    status: number;

    @Expose()
    createdAt: string;

    @Expose()
    updatedAt: string;

    @Expose()
    @Type(() => AccountResponseDto)
    accountOrigin: AccountResponseDto | null;

    @Expose()
    @Type(() => AccountResponseDto)
    accountDestination: AccountResponseDto | null;

    constructor(partial: Partial<TransactionResponseDto>) {
        Object.assign(this, partial);
    }
} 