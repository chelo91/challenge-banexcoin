import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commission } from '../../entities/commission.entity';
import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Commission]),
    forwardRef(() => AccountModule),
  ],
  providers: [CommissionService],
  exports: [CommissionService],
  controllers: [CommissionController],
})
export class CommissionModule {} 