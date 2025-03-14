import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../users/users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockPrismaService } from '../../mocks/prisma.mock';
import { mockUser, mockUsers } from '../../mocks/entities/user.mock';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      jest.spyOn(prisma.user, 'findMany').mockRejectedValue(new Error('Database error'));
      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const result = await service.findOne('999');
      expect(result).toBeNull();
    });
  });
}); 