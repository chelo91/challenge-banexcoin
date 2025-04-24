import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionStatus, TransactionType } from '../../entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { Commission, CommissionStatus } from 'src/entities/commission.entity';

@Injectable()
@Processor('transaction-queue')
export class TransactionQueueProcessor extends WorkerHost {
    constructor(
        private transactionService: TransactionService,
        private dataSource: DataSource,
    ) {
        super();
    }

    async process(job: Job<{ groupTransactionId: string }>): Promise<void> {
        const { groupTransactionId } = job.data;
        const queryRunner = this.dataSource.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            // Get the transaction and all related transactions in the group
            const transactions = await this.transactionService.getByGroupTransactionId(groupTransactionId);

            if (!transactions || transactions.length === 0) {
                throw new Error(`No se encontraron transacciones para el ID de grupo ${groupTransactionId}`);
            }

            const userTransaction = transactions.find(transaction => transaction.type === TransactionType.USER_TO_USER);
            if (!userTransaction) {
                return;
            }

            const accountOriginId = userTransaction.accountOriginId;
            const result = await this.dataSource.query(
                'SELECT get_account_balance($1)',
                [accountOriginId]
            );

            if (!result || result.length === 0) {
                throw new Error(`No se encontró resultado para la cuenta con ID ${accountOriginId}`);
            }

            const balance = Number(result[0].get_account_balance);

            if (isNaN(balance)) {
                throw new Error(`Valor de balance inválido para la cuenta con ID ${accountOriginId}`);
            }

            if (balance <= 0) {
                throw new Error(`El balance es menor que 0 para la cuenta con ID ${accountOriginId}`);
            }

            const isApproved = balance >= (Number(userTransaction.amount) + Number(userTransaction.transactionFee));
            // Update all transactions in the group to APPROVED
            for (const transaction of transactions) {
                transaction.status = isApproved ? TransactionStatus.APPROVED : TransactionStatus.CANCELLED;
                await queryRunner.manager.save(transaction);

                if (transaction.type === TransactionType.REFERRAL_COMMISSION) {
                    // Create commissions for the beneficiary
                    const beneficiary = transaction.accountDestination;
                    if (beneficiary) {
                        const commission = new Commission();
                        commission.transaction = transaction;
                        commission.beneficiary = beneficiary;
                        commission.amount = transaction.amount;
                        commission.currency = transaction.currency;
                        commission.status = CommissionStatus.ENABLED;
                        await queryRunner.manager.save(commission);
                    }
                }
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
} 