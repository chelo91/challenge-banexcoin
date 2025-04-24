import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Account } from 'src/entities/account.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { Commission } from 'src/entities/commission.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Account, Commission, Transaction])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
