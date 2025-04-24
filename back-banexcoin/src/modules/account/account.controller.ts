import { Controller, Get, HttpException, HttpStatus, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionService } from '../transaction/transaction.service';
import { BalanceResponseDto } from '../../dto/balance.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private readonly transactionService: TransactionService
    ) { }

    @Get('balance')
    async getBalance(@Req() req: any): Promise<BalanceResponseDto> {
        try {
            const user = req.user;
            const accounts = await this.accountService.getByUserId(user.id);

            if (!accounts || accounts.length === 0) {
                throw new NotFoundException('Cuenta no encontrada');
            }

            const account = accounts[0];
            return {
                totalBalance: account.balance,
                pendingBalance: account.balancePending,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException('Error al obtener el balance', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
