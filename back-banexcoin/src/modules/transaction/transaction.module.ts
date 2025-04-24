import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Transaction } from '../../entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { AuthModule } from '../auth/auth.module';
import { AccountModule } from '../account/account.module';
import { UserModule } from '../user/user.module';
import { CommissionModule } from '../commission/commission.module';
import { TransactionController } from './transaction.controller';
import { TransactionQueueProcessor } from './transaction-queue.processor';
import { TransactionQueueService } from './transaction-queue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    BullModule.registerQueue({
      name: 'transaction-queue',
    }),
    AuthModule,
    forwardRef(() => AccountModule),
    UserModule,
    forwardRef(() => CommissionModule)
  ],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionQueueProcessor, TransactionQueueService],
  exports: [TransactionService],
})
export class TransactionModule {}
