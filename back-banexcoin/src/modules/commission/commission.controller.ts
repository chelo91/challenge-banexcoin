import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { AccountService } from '../account/account.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('commissions')
@UseGuards(JwtAuthGuard)
export class CommissionController {
    constructor(
        private readonly commissionService: CommissionService,
        private readonly accountService: AccountService
    ) {}

    @Get()
    async getCommissions(@Req() req: any) {
        const user = req.user;
        const accounts = await this.accountService.getByUserId(user.id);
        const account = accounts[0];
        return await this.commissionService.getByAccount(account);
    }
}