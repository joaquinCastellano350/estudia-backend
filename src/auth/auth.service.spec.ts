import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('registers a new user when email is free', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    const createdUser = {
      id: '1',
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      hashed_password: 'hashed-password',
    };
    mockUsersService.create.mockResolvedValue(createdUser);
    mockJwtService.signAsync.mockResolvedValue('jwt-token');

    const dto = {
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      password: 'secret123',
    };

    const result = await service.register(dto);

    expect(mockUsersService.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockUsersService.create).toHaveBeenCalledWith({
      ...dto,
      password: 'hashed-password',
    });
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      sub: createdUser.id,
      email: createdUser.email,
    });
    expect(result).toEqual({
      access_token: 'jwt-token',
      user: {
        id: createdUser.id,
        name: createdUser.name,
        lastname: createdUser.lastname,
        email: createdUser.email,
      },
    });
  });

  it('throws a conflict when registering with an existing email', async () => {
    mockUsersService.findByEmail.mockResolvedValue({ id: 'existing-user' });

    const dto = {
      name: 'Jane',
      lastname: 'Doe',
      email: 'jane@example.com',
      password: 'password',
    };

    await expect(service.register(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(mockUsersService.create).not.toHaveBeenCalled();
  });

  it('logs in when credentials are valid', async () => {
    const user = {
      id: '1',
      email: 'john@example.com',
      name: 'John',
      lastname: 'Doe',
      hashed_password: 'hashed',
    };
    mockUsersService.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.signAsync.mockResolvedValue('jwt-token');

    const dto = { email: 'john@example.com', password: 'secret123' };
    const result = await service.login(dto);

    expect(mockUsersService.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      dto.password,
      user.hashed_password,
    );
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
    expect(result).toEqual({
      access_token: 'jwt-token',
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
      },
    });
  });

  it('throws unauthorized when user is not found', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@example.com', password: 'secret' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws unauthorized when password is invalid', async () => {
    const user = {
      id: '1',
      email: 'john@example.com',
      name: 'John',
      lastname: 'Doe',
      hashed_password: 'hashed',
    };
    mockUsersService.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: 'john@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });
});
