import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('creates a new user with a hashed password', async () => {
    const dto = {
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      password: 'hashed-password',
    };
    const createdUser = { id: '1', ...dto, hashed_password: dto.password };
    mockPrismaService.user.create.mockResolvedValue(createdUser);

    const result = await service.create(dto);

    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        lastname: dto.lastname,
        email: dto.email,
        hashed_password: dto.password,
      },
    });
    expect(result).toEqual(createdUser);
  });

  it('returns undefined and logs on create error', async () => {
    const dto = {
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      password: 'hashed',
    };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockPrismaService.user.create.mockRejectedValue(new Error('db failure'));

    const result = await service.create(dto);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('finds a user by email', async () => {
    const user = { id: '1', email: 'john@example.com' };
    mockPrismaService.user.findUnique.mockResolvedValue(user);

    const result = await service.findByEmail('john@example.com');

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
    });
    expect(result).toEqual(user);
  });

  it('finds a user by id', async () => {
    const user = { id: '1', email: 'john@example.com' };
    mockPrismaService.user.findUnique.mockResolvedValue(user);

    const result = await service.findById('1');

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(user);
  });
});
