import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDTO } from '../../dto/user.dto';
import { AccountReferralDTO } from '../../dto/referral.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async getAll(): Promise<UserResponseDTO[]> {
    const users = await this.userService.getAllAvailable();
    return plainToInstance(UserResponseDTO, users, {
      excludeExtraneousValues: true
    });
  }

  @Get('referrals')
  async getReferrals(@Req() req: any): Promise<AccountReferralDTO[]> {
    const user = req.user;
    const referrals = await this.userService.getReferrals(user.id);
    return referrals;
  }
} 