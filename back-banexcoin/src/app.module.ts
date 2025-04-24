import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AccountModule } from './modules/account/account.module';
import { CommissionModule } from './modules/commission/commission.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { Commission } from './entities/commission.entity';
import { Transaction } from './entities/transaction.entity';
import { AccountController } from './modules/account/account.controller';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseInitModule } from './modules/database/database-init.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'postgres'),
        entities: [User, Account, Commission, Transaction],
        synchronize: false,
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    AuthModule,
    UserModule,
    AccountModule,
    CommissionModule,
    TransactionModule,
    DatabaseInitModule
  ],
  controllers: [AppController, AccountController],
  providers: [AppService],
})
export class AppModule {}
