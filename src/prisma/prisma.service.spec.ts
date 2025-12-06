import { PrismaService } from './prisma.service.js';
import { prismaClientMock, prismaPgMock } from '../test-setup.js';

describe('PrismaService', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
  });

  afterAll(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it('throws when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;

    expect(() => new PrismaService()).toThrow('DATABASE_URL not set');
  });

  it('instantiates with the configured adapter', () => {
    const service = new PrismaService();

    expect(prismaPgMock).toHaveBeenCalledWith({
      connectionString: 'postgres://user:pass@localhost:5432/db',
    });
    expect(service).toBeInstanceOf(PrismaService);
  });

  it('connects and disconnects on lifecycle hooks', async () => {
    const service = new PrismaService();

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(prismaClientMock.$connect).toHaveBeenCalled();
    expect(prismaClientMock.$disconnect).toHaveBeenCalled();
  });
});
