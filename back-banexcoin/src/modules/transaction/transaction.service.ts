import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType } from '../../entities/transaction.entity';
import { CreateTransactionServiceDto } from '../../dto/create-transaction-service.dto';
import { calcWithDecimal } from '../../utils/number.utils';
import { TransactionQueueService } from './transaction-queue.service';
import { Account } from 'src/entities/account.entity';
import { CommissionService } from '../commission/commission.service';
import { CommissionStatus } from 'src/entities/commission.entity';
import { Commission } from 'src/entities/commission.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
    private transactionQueueService: TransactionQueueService,
    private commissionService: CommissionService
  ) { }

  async getById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: {
        id,
        status: TransactionStatus.APPROVED
      }
    });
  }

  async getAll(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: {
        status: TransactionStatus.APPROVED
      }
    });
  }

  async getByGroupTransactionId(groupTransactionId: string): Promise<Transaction[]> {
    return this.transactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.accountOrigin', 'origin')
      .leftJoinAndSelect('transaction.accountDestination', 'destination')
      .where('transaction.groupTransactionId = :groupTransactionId', { groupTransactionId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.PENDING })
      .getMany();
  }

  async getByAccount(account: Account): Promise<Transaction[]> {
    return this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.accountOrigin', 'origin')
      .leftJoinAndSelect('transaction.accountDestination', 'destination')
      .leftJoinAndSelect('origin.user', 'userOrigin')
      .leftJoinAndSelect('destination.user', 'userDestination')
      .where('transaction.accountOriginId = :accountId', { accountId: account.id })
      .orWhere('transaction.accountDestinationId = :accountId', { accountId: account.id })
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
  }

  async createTransaction(dto: CreateTransactionServiceDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const groupTransactionId = crypto.randomUUID();
    try {
      // 1. Transacción principal
      const mainTransaction = new Transaction();
      mainTransaction.accountOrigin = dto.accountOrigin;
      mainTransaction.accountDestination = dto.accountDestination;
      mainTransaction.amount = dto.amount;
      mainTransaction.transactionFee = dto.amountFee;
      mainTransaction.type = dto.type;
      mainTransaction.status = TransactionStatus.PENDING;
      mainTransaction.groupTransactionId = groupTransactionId;
      const savedMainTransaction = await queryRunner.manager.save(mainTransaction);

      let amountFee = dto.amountFee;
      // 2. Comisión para el referido (si existe)
      if (dto.accountReferrer) {
        const { fee, ref, plat } = calcWithDecimal(dto.amount);
        amountFee = plat;
        const referrerCommission = new Transaction();
        referrerCommission.accountOrigin = null;
        referrerCommission.accountDestination = dto.accountReferrer;
        referrerCommission.amount = ref;
        referrerCommission.transactionFee = 0;
        referrerCommission.type = TransactionType.REFERRAL_COMMISSION;
        referrerCommission.status = TransactionStatus.PENDING;
        referrerCommission.groupTransactionId = groupTransactionId;
        await queryRunner.manager.save(referrerCommission);
      }

      // 3. Comisión para el sistema
      const systemCommission = new Transaction();
      systemCommission.accountOrigin = dto.accountOrigin;
      systemCommission.accountDestination = null;
      systemCommission.amount = dto.amountFee;
      systemCommission.transactionFee = 0;
      systemCommission.type = TransactionType.PLATFORM_FEE;
      systemCommission.status = TransactionStatus.PENDING;
      systemCommission.groupTransactionId = groupTransactionId;
      await queryRunner.manager.save(systemCommission);

      await queryRunner.commitTransaction();

      await this.transactionQueueService.addTransactionToQueue(groupTransactionId);

      return savedMainTransaction;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}