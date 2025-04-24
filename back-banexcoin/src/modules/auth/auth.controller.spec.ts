import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException, HttpException } from '@nestjs/common';
import { LoginDTO } from '../../dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockLoginDto: LoginDTO = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      // Add other user properties as needed
    };

    const mockToken = {
      access_token: 'mock-jwt-token',
    };

    it('should successfully login and return a token', async () => {
      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockToken);

      const result = await controller.login(mockLoginDto);

      expect(result).toEqual(mockToken);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(mockLoginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should throw HttpException when an unexpected error occurs', async () => {
      mockAuthService.validateUser.mockRejectedValue(new Error('Unexpected error'));

      await expect(controller.login(mockLoginDto)).rejects.toThrow(HttpException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });
}); 