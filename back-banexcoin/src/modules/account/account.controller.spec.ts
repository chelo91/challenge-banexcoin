import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TransactionService } from '../transaction/transaction.service';
import { NotFoundException, HttpException } from '@nestjs/common';
import { BalanceResponseDto } from '../../dto/balance.dto';

describe('AccountController', () => {
  let controller: AccountController;
  let accountService: AccountService;
  let transactionService: TransactionService;

  const mockAccountService = {
    getByUserId: jest.fn(),
  };

  const mockTransactionService = {
    // Add any transaction service methods if needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    accountService = module.get<AccountService>(AccountService);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
    };

    const mockAccount = {
      id: '1',
      balance: 1000,
      balancePending: 500,
      userId: '1',
    };

    const expectedBalanceResponse: BalanceResponseDto = {
      totalBalance: 1000,
      pendingBalance: 500,
    };

    it('should return the balance for a valid user account', async () => {
      mockAccountService.getByUserId.mockResolvedValue([mockAccount]);

      const result = await controller.getBalance({ user: mockUser });

      expect(result).toEqual(expectedBalanceResponse);
      expect(mockAccountService.getByUserId).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when no account is found', async () => {
      mockAccountService.getByUserId.mockResolvedValue([]);

      await expect(controller.getBalance({ user: mockUser })).rejects.toThrow(NotFoundException);
      expect(mockAccountService.getByUserId).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw HttpException when an unexpected error occurs', async () => {
      mockAccountService.getByUserId.mockRejectedValue(new Error('Database error'));

      await expect(controller.getBalance({ user: mockUser })).rejects.toThrow(HttpException);
      expect(mockAccountService.getByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
