import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('delegates register to the auth service', async () => {
    const dto = {
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      password: 'secret123',
    };
    const response = { access_token: 'token', user: { id: '1', ...dto } };
    mockAuthService.register.mockResolvedValue(response);

    const result = await controller.register(dto);

    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });

  it('delegates login to the auth service', async () => {
    const dto = { email: 'john@example.com', password: 'secret123' };
    const response = {
      access_token: 'token',
      user: { id: '1', email: dto.email },
    };
    mockAuthService.login.mockResolvedValue(response);

    const result = await controller.login(dto);

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });

  it('returns the authenticated profile in getProfile', () => {
    const req = {
      user: { id: '1', email: 'john@example.com' },
    } as any;

    const result = controller.getProfile(req);

    expect(result).toEqual(req.user);
  });
});
