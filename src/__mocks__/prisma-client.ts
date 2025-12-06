export const prismaClientMockInstance = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

export class PrismaClient {
  $connect = prismaClientMockInstance.$connect;
  $disconnect = prismaClientMockInstance.$disconnect;
  user = prismaClientMockInstance.user;
}
