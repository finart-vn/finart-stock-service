import { User } from '@prisma/client';

export const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed_password',
  passwordSalt: 'salt',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-01T00:00:00Z'),
};

export const mockUsers: User[] = [
  mockUser,
  {
    id: '2',
    email: 'user2@example.com',
    name: 'User Two',
    passwordHash: 'hashed_password2',
    passwordSalt: 'salt2',
    createdAt: new Date('2023-01-02T00:00:00Z'),
    updatedAt: new Date('2023-01-02T00:00:00Z'),
  },
  {
    id: '3',
    email: 'user3@example.com',
    name: 'User Three',
    passwordHash: 'hashed_password3',
    passwordSalt: 'salt3',
    createdAt: new Date('2023-01-03T00:00:00Z'),
    updatedAt: new Date('2023-01-03T00:00:00Z'),
  },
]; 