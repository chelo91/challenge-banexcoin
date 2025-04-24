import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AccountReferralDTO, ReferralAccountDTO, ReferralUserDTO } from '../../dto/referral.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getAllAvailable: jest.fn(),
    getReferrals: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    const mockUsers = [
      {
        id: '1',
        email: 'user1@example.com',
        // Add other user properties as needed
      },
      {
        id: '2',
        email: 'user2@example.com',
        // Add other user properties as needed
      },
    ];

    it('should return an array of UserResponseDTO', async () => {
      mockUserService.getAllAvailable.mockResolvedValue(mockUsers);

      const result = await controller.getAll();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(mockUsers.length);
      expect(mockUserService.getAllAvailable).toHaveBeenCalled();
    });
  });

  describe('getReferrals', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
    };

    const mockReferralUser: ReferralUserDTO = {
      id: '2',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    const mockReferralAccount: ReferralAccountDTO = {
      id: '1',
      user: mockReferralUser,
    };

    const mockReferrals: AccountReferralDTO[] = [
      {
        id: '1',
        referrerMe: mockReferralAccount,
        referralsForMe: [mockReferralAccount],
      },
    ];

    it('should return an array of AccountReferralDTO', async () => {
      mockUserService.getReferrals.mockResolvedValue(mockReferrals);

      const result = await controller.getReferrals({ user: mockUser });

      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual(mockReferrals);
      expect(mockUserService.getReferrals).toHaveBeenCalledWith(mockUser.id);
    });
  });
}); 