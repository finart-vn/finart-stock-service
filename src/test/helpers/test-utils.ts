import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';

export async function createTestingModule(providers: any[] = [], controllers: any[] = []) {
  const mockPrisma = createMockPrismaService();

  const moduleRef = await Test.createTestingModule({
    controllers,
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: mockPrisma,
      },
    ],
  }).compile();

  return {
    module: moduleRef,
    prisma: mockPrisma,
  };
}

export function expectDateToBeRecent(date: Date) {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  expect(date).toBeInstanceOf(Date);
  expect(date.getTime()).toBeGreaterThanOrEqual(fiveMinutesAgo.getTime());
  expect(date.getTime()).toBeLessThanOrEqual(now.getTime());
} 