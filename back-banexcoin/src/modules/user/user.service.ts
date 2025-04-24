import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../entities/user.entity';
import { Account } from 'src/entities/account.entity';
import { AccountReferralDTO } from '../../dto/referral.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async getById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id, status: UserStatus.ENABLED } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email, status: UserStatus.ENABLED } });
  }

  async getAll(): Promise<User[]> {
    return this.userRepository.find({ where: { status: UserStatus.ENABLED } });
  }

  async getAllAvailable(): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.accounts', 'account') // solo si tiene relación con Account
      .where('user.status = :status', { status: UserStatus.ENABLED })
      .getMany();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async getReferrals(userId: string): Promise<AccountReferralDTO[]> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.accounts', 'account')
      .leftJoinAndSelect('account.referrer', 'referrer')
      .leftJoinAndSelect('referrer.user', 'referrerUser')
      .leftJoinAndSelect('account.referrals', 'referrals')
      .leftJoinAndSelect('referrals.user', 'referredUser')
      .where('user.status = :status', { status: UserStatus.ENABLED })
      .andWhere('account.userId = :userId', { userId })
      .getOne();

    if (!user || !user.accounts || user.accounts.length === 0) {
      return [];
    }

    return user.accounts.map(account => ({
      id: account.id,
      referrerMe: account.referrer ? {
        id: account.referrer.id,
        user: account.referrer.user ? {
          id: account.referrer.user.id,
          firstName: account.referrer.user.firstName,
          lastName: account.referrer.user.lastName,
          email: account.referrer.user.email
        } : null
      } : null,
      referralsForMe: account.referrals ? account.referrals.map(referral => ({
        id: referral.id,
        user: referral.user ? {
          id: referral.user.id,
          firstName: referral.user.firstName,
          lastName: referral.user.lastName,
          email: referral.user.email
        } : null
      })) : []
    }));
  }
}