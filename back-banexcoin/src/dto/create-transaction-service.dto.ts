import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { Account } from 'src/entities/account.entity';

export class CreateTransactionServiceDto {
  @IsNotEmpty()
  accountOrigin: Account;

  @IsNotEmpty()
  accountDestination: Account;

  @IsNotEmpty()
  @IsNumber()
  @Min(2)
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(2)
  amountTotal: number;

  @IsNotEmpty()
  @IsNumber()
  amountFee: number;

  @IsNotEmpty()
  @IsString()
  type: TransactionType;

  @IsString()
  status: TransactionStatus;

  @IsOptional()
  accountReferrer: Account | null;
} 