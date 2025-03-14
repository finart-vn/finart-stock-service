import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../users/users.controller';
import { UsersService } from '../../../users/users.service';
import { createMockUsersService } from '../../mocks/services/users.service.mock';
import { mockUser, mockUsers } from '../../mocks/entities/user.mock';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { createTestingModule } from '../../helpers/test-utils';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const { module } = await createTestingModule(
      [
        {
          provide: UsersService,
          useValue: createMockUsersService(),
        },
      ],
      [UsersController]
    );

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user when it exists', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should return 404 when user does not exist', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);
      
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith('999');
    });

    it('should handle invalid ID format', async () => {
      jest.spyOn(service, 'findOne').mockImplementation(() => {
        throw new BadRequestException('Invalid user ID');
      });
      
      await expect(controller.findOne('invalid')).rejects.toThrow(BadRequestException);
    });
  });
}); 