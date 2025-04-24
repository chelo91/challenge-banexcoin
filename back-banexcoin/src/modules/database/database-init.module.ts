import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserStatus, UserType } from '../../entities/user.entity';
import { Account } from '../../entities/account.entity';
import { Commission } from '../../entities/commission.entity';
import { Transaction, TransactionType, TransactionStatus } from '../../entities/transaction.entity';
import { DatabaseSeedService } from './database-seed.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, Commission, Transaction]),
    ConfigModule,
  ],
  providers: [DatabaseSeedService],
  exports: [DatabaseSeedService],
})
export class DatabaseInitModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseInitModule.name);

  constructor(private readonly databaseSeedService: DatabaseSeedService) { }

  async onApplicationBootstrap() {
    try {
      this.logger.log('Iniciando inicialización de la base de datos...');

      // Verificar si ya existen usuarios en la base de datos
      const hasUsers = await this.databaseSeedService.hasExistingUsers();
      if (hasUsers) {
        this.logger.log('La base de datos ya está inicializada. Omitiendo la creación de usuarios iniciales.');
        return;
      }
      this.logger.log('No hay usuarios en la base de datos. Creando usuarios iniciales...');

      // Create test users first (they will be referrers for admin)
      const testUser1 = await this.databaseSeedService.createUserWithAccount({
        email: 'user1@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User 1',
        type: UserType.USER,
        status: UserStatus.ENABLED,
      });
      this.logger.log(`Test user 1 created with ID: ${testUser1.user.id}`);

      const testUser2 = await this.databaseSeedService.createUserWithAccount({
        email: 'user2@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User 2',
        type: UserType.USER,
        status: UserStatus.ENABLED,
      });
      this.logger.log(`Test user 2 created with ID: ${testUser2.user.id}`);

      // Create admin user with testUser1 as referrer
      const adminResult = await this.databaseSeedService.createUserWithAccount({
        email: 'admin@banexcoin.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'Admin',
        type: UserType.ADMIN,
        status: UserStatus.ENABLED,
        referrerAccountId: testUser1.account.id, // Admin is referred by testUser1
      });
      this.logger.log(`Admin user created with ID: ${adminResult.user.id} and referred by testUser1`);

      // Create a worker user referred by admin
      const workerUser = await this.databaseSeedService.createUserWithAccount({
        email: 'worker@test.com',
        password: 'password123',
        firstName: 'Worker',
        lastName: 'User',
        type: UserType.WORKER,
        status: UserStatus.ENABLED,
        referrerAccountId: adminResult.account.id, // Worker is referred by admin
      });
      this.logger.log(`Worker user created with ID: ${workerUser.user.id} and referred by admin`);

      // Create a disabled user
      const disabledUser = await this.databaseSeedService.createUserWithAccount({
        email: 'disabled@test.com',
        password: 'password123',
        firstName: 'Disabled',
        lastName: 'User',
        type: UserType.USER,
        status: UserStatus.DISABLED,
      });

      // Create test transaction for admin
      const testTransaction = await this.databaseSeedService.createTransaction({
        accountDestinationId: adminResult.account.id,
        amount: 1000.00,
        currency: 'USD',
        transactionFee: 0.00,
        type: TransactionType.MANUAL_ADJUSTMENT,
        status: TransactionStatus.APPROVED,
      });

      this.logger.log(`Test transaction created for admin with ID: ${testTransaction.id}`);

      this.logger.log(`Disabled user created with ID: ${disabledUser.user.id}`);

      this.logger.log('Database initialization completed successfully');
    } catch (error) {
      this.logger.error('Error during database initialization:', error);
      throw error;
    }
  }
} 