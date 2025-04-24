import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { AccountStatus } from '../../entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async getById(id: string): Promise<Account | null> {
    return this.accountRepository.findOne({ where: { id, status: AccountStatus.ENABLED } });
  }

  async getAll(): Promise<Account[]> {
    return this.accountRepository.find({ where: { status: AccountStatus.ENABLED } });
  }

  async getByUserId(userId: string): Promise<Account[]> {
    return this.accountRepository.find({ where: { userId, status: AccountStatus.ENABLED } });
  }

  async create(accountData: Partial<Account>): Promise<Account> {
    const account = this.accountRepository.create(accountData);
    return this.accountRepository.save(account);
  }
} 