import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

type PartialUser = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'passwordSalt'>> & {
  password?: string;
};

export class UserFactory {
  static async create(overrides: PartialUser = {}): Promise<User> {
    const defaultProps = {
      email: `user-${Math.random().toString(36).substring(7)}@example.com`,
      name: `Test User ${Math.random().toString(36).substring(7)}`,
      password: 'password123',
    };

    const merged = { ...defaultProps, ...overrides };
    const { password, ...rest } = merged;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password!, salt);

    return {
      id: `user-${Math.random().toString(36).substring(7)}`,
      ...rest,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async createMany(count: number, overrides: PartialUser = {}): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(overrides));
    }
    return users;
  }
} 