import { Test, TestingModule } from '@nestjs/testing';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { AccountService } from '../account/account.service';

describe('CommissionController', () => {
  let controller: CommissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionController],
      providers: [
        {
          provide: CommissionService,
          useValue: {
            getByAccount: jest.fn(),
          },
        },
        {
          provide: AccountService,
          useValue: {
            getByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommissionController>(CommissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
