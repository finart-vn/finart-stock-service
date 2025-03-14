import { UsersService } from '../../../users/users.service';
import { mockUser, mockUsers } from '../entities/user.mock';

export const createMockUsersService = () => {
  return {
    findAll: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn().mockImplementation((id: string) => {
      if (id === '1') {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    }),
    // Add other methods as needed
  } as unknown as UsersService;
}; 