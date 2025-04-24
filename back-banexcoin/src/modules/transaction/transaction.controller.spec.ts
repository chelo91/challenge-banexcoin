import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AccountService } from '../account/account.service';
import { BadRequestException, HttpException } from '@nestjs/common';
import { Transaction, TransactionStatus, TransactionType } from '../../entities/transaction.entity';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { TransactionResponseDto } from '../../dto/transaction-response.dto';
import { Account, AccountStatus } from '../../entities/account.entity';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: TransactionService;
  let accountService: AccountService;

  const mockTransactionService = {
    getByAccount: jest.fn(),
    createTransaction: jest.fn(),
  };

  const mockAccountService = {
    getByUserId: jest.fn(),
    getById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get<TransactionService>(TransactionService);
    accountService = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
    };

    const mockAccount: Partial<Account> = {
      id: '1',
      balance: 1000,
      balancePending: 0,
      currency: 'USD',
      userId: '1',
      referrerAccountId: undefined,
      status: AccountStatus.ENABLED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockTransactions: Partial<Transaction>[] = [
      {
        id: '1',
        groupTransactionId: '1',
        accountOriginId: '1',
        accountDestinationId: '1',
        amount: 100,
        currency: 'USD',
        transactionFee: 1,
        type: TransactionType.USER_TO_USER,
        status: TransactionStatus.PENDING,
        accountOrigin: mockAccount as Account,
        accountDestination: mockAccount as Account,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return an array of TransactionResponseDto', async () => {
      mockAccountService.getByUserId.mockResolvedValue([mockAccount]);
      mockTransactionService.getByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.getTransactions({ user: mockUser });

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(TransactionResponseDto);
      expect(mockAccountService.getByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(mockTransactionService.getByAccount).toHaveBeenCalledWith(mockAccount);
    });
  });

  describe('createTransaction', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
    };

    const mockAccountOrigin: Partial<Account> = {
      id: '1',
      balance: 1000,
      balancePending: 0,
      currency: 'USD',
      userId: '1',
      referrerAccountId: '3',
      status: AccountStatus.ENABLED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAccountDestination: Partial<Account> = {
      id: '2',
      balance: 500,
      balancePending: 0,
      currency: 'USD',
      userId: '2',
      referrerAccountId: undefined,
      status: AccountStatus.ENABLED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAccountReferrer: Partial<Account> = {
      id: '3',
      balance: 200,
      balancePending: 0,
      currency: 'USD',
      userId: '3',
      referrerAccountId: undefined,
      status: AccountStatus.ENABLED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCreateTransactionDto: CreateTransactionDto = {
      accountDestinationId: '2',
      amount: 100,
    };

    const mockTransaction: Partial<Transaction> = {
      id: '1',
      groupTransactionId: '1',
      accountOriginId: '1',
      accountDestinationId: '2',
      amount: 100,
      currency: 'USD',
      transactionFee: 1,
      type: TransactionType.USER_TO_USER,
      status: TransactionStatus.PENDING,
      accountOrigin: mockAccountOrigin as Account,
      accountDestination: mockAccountDestination as Account,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a transaction successfully', async () => {
      mockAccountService.getByUserId.mockResolvedValue([mockAccountOrigin]);
      mockAccountService.getById
        .mockResolvedValueOnce(mockAccountDestination)
        .mockResolvedValueOnce(mockAccountReferrer);
      mockTransactionService.createTransaction.mockResolvedValue(mockTransaction);

      const result = await controller.createTransaction({ user: mockUser }, mockCreateTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(mockAccountService.getByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(mockAccountService.getById).toHaveBeenCalledWith(mockCreateTransactionDto.accountDestinationId);
      expect(mockTransactionService.createTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when accounts are not found', async () => {
      mockAccountService.getByUserId.mockResolvedValue([]);
      mockAccountService.getById.mockResolvedValue(null);

      await expect(controller.createTransaction({ user: mockUser }, mockCreateTransactionDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when origin and destination accounts are the same', async () => {
      mockAccountService.getByUserId.mockResolvedValue([mockAccountOrigin]);
      mockAccountService.getById.mockResolvedValue(mockAccountOrigin);

      await expect(controller.createTransaction({ user: mockUser }, { ...mockCreateTransactionDto, accountDestinationId: '1' }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when there is insufficient balance', async () => {
      mockAccountService.getByUserId.mockResolvedValue([{ ...mockAccountOrigin, balance: 50 }]);
      mockAccountService.getById.mockResolvedValue(mockAccountDestination);

      await expect(controller.createTransaction({ user: mockUser }, mockCreateTransactionDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw HttpException when an unexpected error occurs', async () => {
      mockAccountService.getByUserId.mockRejectedValue(new Error('Database error'));

      await expect(controller.createTransaction({ user: mockUser }, mockCreateTransactionDto))
        .rejects.toThrow(HttpException);
    });
  });
});
