import { PrismaClient } from '@prisma/client';
import { mockUsers, mockUser } from './entities/user.mock';
import { mockBoards } from './entities/board.mock';

export const createMockPrismaService = () => {
  return {
    user: {
      findMany: jest.fn().mockResolvedValue(mockUsers),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id) {
          const user = mockUsers.find(u => u.id === where.id);
          return Promise.resolve(user || null);
        }
        if (where.email) {
          const user = mockUsers.find(u => u.email === where.email);
          return Promise.resolve(user || null);
        }
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          ...data,
          id: 'new-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        return Promise.resolve({
          ...mockUser,
          ...data,
          id: where.id,
          updatedAt: new Date(),
        });
      }),
      delete: jest.fn().mockResolvedValue(mockUser),
    },
    board: {
      findMany: jest.fn().mockResolvedValue(mockBoards),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        const board = mockBoards.find(b => b.id === where.id);
        return Promise.resolve(board || null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          ...data,
          id: 'new-board-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }),
    },
    $transaction: jest.fn().mockImplementation((callback) => {
      return callback(this);
    }),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  } as unknown as PrismaClient;
}; 