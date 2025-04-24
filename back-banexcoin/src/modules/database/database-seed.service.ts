import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType, UserStatus } from '../../entities/user.entity';
import { Account, AccountStatus } from '../../entities/account.entity';
import { Transaction, TransactionType, TransactionStatus } from '../../entities/transaction.entity';
import { Commission, CommissionStatus } from '../../entities/commission.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseSeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Commission)
    private readonly commissionRepository: Repository<Commission>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Check if there are any existing users in the database
   */
  async hasExistingUsers(): Promise<boolean> {
    const count = await this.userRepository.count();
    return count > 0;
  }

  /**
   * Creates a user with the given data
   */
  async createUser(
    userData: {
      id?: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      type?: UserType;
      status?: UserStatus;
    }
  ): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      return this.userRepository.save({
        id: userData.id,
        email: userData.email,
        hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        type: userData.type || UserType.USER,
        status: userData.status || UserStatus.ENABLED,
      });
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Creates an account for a user
   */
  async createAccount(
    accountData: {
      id?: string;
      userId: string;
      balance?: number;
      currency?: string;
      referrerAccountId?: string;
      status?: AccountStatus;
    }
  ): Promise<Account> {
    try {
      const defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY', 'USD');
      
      return this.accountRepository.save({
        id: accountData.id,
        userId: accountData.userId,
        balance: accountData.balance || 0,
        currency: accountData.currency || defaultCurrency,
        referrerAccountId: accountData.referrerAccountId,
        status: accountData.status || AccountStatus.ENABLED,
      });
    } catch (error) {
      throw new Error(`Failed to create account: ${error.message}`);
    }
  }

  /**
   * Creates a transaction between two accounts
   */
  async createTransaction(
    transactionData: {
      id?: string;
      accountOriginId?: string;
      accountDestinationId?: string;
      amount: number;
      currency?: string;
      transactionFee?: number;
      type?: TransactionType;
      status?: TransactionStatus;
    }
  ): Promise<Transaction> {
    try {
      const defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY', 'USD');
      
      return this.transactionRepository.save({
        id: transactionData.id,
        accountOriginId: transactionData.accountOriginId || null,
        accountDestinationId: transactionData.accountDestinationId || null,
        amount: transactionData.amount,
        currency: transactionData.currency || defaultCurrency,
        transactionFee: transactionData.transactionFee || 0,
        type: transactionData.type || TransactionType.USER_TO_USER,
        status: transactionData.status || TransactionStatus.APPROVED,
      });
    } catch (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  /**
   * Creates a commission for a transaction
   */
  async createCommission(
    commissionData: {
      id?: string;
      transactionId: string;
      beneficiaryId: string;
      amount: number;
      currency?: string;
      status?: CommissionStatus;
    }
  ): Promise<Commission> {
    try {
      const defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY', 'USD');
      
      return this.commissionRepository.save({
        id: commissionData.id,
        transactionId: commissionData.transactionId,
        beneficiaryId: commissionData.beneficiaryId,
        amount: commissionData.amount,
        currency: commissionData.currency || defaultCurrency,
        status: commissionData.status || CommissionStatus.ENABLED,
      });
    } catch (error) {
      throw new Error(`Failed to create commission: ${error.message}`);
    }
  }

  /**
   * Creates a complete user with account and transactions
   */
  async createUserWithAccount(
    userData: {
      id?: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      type?: UserType;
      status?: UserStatus;
      balance?: number;
      currency?: string;
      referrerAccountId?: string;
    }
  ): Promise<{ user: User; account: Account; }> {
    try {
      // Create user uuid
      const userUuid = crypto.randomUUID();
      // Create user
      const user = await this.createUser({
        ...userData,
        id: userUuid,
      });

      // Create account uuid
      const accountUuid = crypto.randomUUID();
      // Create account
      const account = await this.createAccount({
        id: accountUuid,
        userId: userUuid,
        currency: userData.currency,
        referrerAccountId: userData.referrerAccountId,
      });

      return { user, account };
    } catch (error) {
      throw new Error(`Failed to create user with account: ${error.message}`);
    }
  }
} 