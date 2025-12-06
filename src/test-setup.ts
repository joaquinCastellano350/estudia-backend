import { prismaClientMockInstance } from './__mocks__/prisma-client.js';

export const prismaClientMock = prismaClientMockInstance;
export const prismaPgMock = jest.fn().mockImplementation(() => ({}));

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: prismaPgMock,
}));
