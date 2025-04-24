import { IsNotEmpty, IsNumber, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  accountDestinationId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(2)
  amount: number;
} 