import { Controller, Post, Req, Body, UseGuards, HttpException, HttpStatus, BadRequestException, Get } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AccountService } from '../account/account.service';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { CreateTransactionServiceDto } from '../../dto/create-transaction-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Transaction, TransactionStatus, TransactionType } from '../../entities/transaction.entity';
import { roundToTwoDecimals } from '../../utils/number.utils';
import { TransactionResponseDto } from '../../dto/transaction-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService,
        private readonly accountService: AccountService
    ) { }

    @Get()
    async getTransactions(@Req() req: any): Promise<TransactionResponseDto[]> {
        const user = req.user;
        const accounts = await this.accountService.getByUserId(user.id);
        const account = accounts[0];
        const transactions = await this.transactionService.getByAccount(account);
        
        return plainToInstance(TransactionResponseDto, transactions, { 
            excludeExtraneousValues: true 
        });
    }

    @Post()
    async createTransaction(@Req() req: any, @Body() body: CreateTransactionDto): Promise<Transaction> {
        try {
            const user = req.user;
            const accounts = await this.accountService.getByUserId(user.id);
            const accountOrigin = accounts[0];
            const accountDestination = await this.accountService.getById(body.accountDestinationId);
            const accountReferrer = await this.accountService.getById(accountOrigin.referrerAccountId) || null;
            // Redondear el monto a 2 decimales
            const amount = roundToTwoDecimals(body.amount);
            const amountFee = roundToTwoDecimals(amount * 0.01);
            const amountTotal = amount + amountFee;

            if (!accountOrigin || !accountDestination) {
                throw new BadRequestException('Cuenta no encontrada');
            }

            if (accountOrigin.id === accountDestination.id) {
                throw new BadRequestException('La cuenta de origen y destino no pueden ser la misma');
            }

            if (accountOrigin.balance < amountTotal) {
                throw new BadRequestException('Saldo insuficiente');
            }

            const serviceDto: CreateTransactionServiceDto = {
                accountOrigin: accountOrigin,
                accountDestination: accountDestination,
                amountTotal: amountTotal,
                amount: amount,
                amountFee: amountFee,
                type: TransactionType.USER_TO_USER,
                status: TransactionStatus.PENDING,
                accountReferrer: accountReferrer
            };

            return await this.transactionService.createTransaction(serviceDto);
        } catch (error) {
            if (error instanceof Error) {
                throw new BadRequestException(error.message);
            }

            throw new HttpException('Error al crear la transacción', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
