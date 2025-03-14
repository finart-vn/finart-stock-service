import { Board } from '@prisma/client';

export const mockBoard: Board = {
  id: '1',
  name: 'Test Board',
  ownerId: '1',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-01T00:00:00Z'),
};

export const mockBoards: Board[] = [
  mockBoard,
  {
    id: '2',
    name: 'Second Board',
    ownerId: '1',
    createdAt: new Date('2023-01-02T00:00:00Z'),
    updatedAt: new Date('2023-01-02T00:00:00Z'),
  },
]; 