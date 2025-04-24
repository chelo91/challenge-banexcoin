import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TransactionQueueService {
  constructor(
    @InjectQueue('transaction-queue') private transactionQueue: Queue,
  ) {}

  async addTransactionToQueue(groupTransactionId: string): Promise<void> {
    await this.transactionQueue.add(
      'process-transaction',
      { groupTransactionId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }
} 