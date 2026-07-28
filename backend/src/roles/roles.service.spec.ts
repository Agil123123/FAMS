import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { DatabaseService } from '../database/database.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let db: DatabaseService;

  const mockPrisma: any = {
    role: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    permission: {
      findMany: jest.fn(),
    },
    rolePermission: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: DatabaseService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw ConflictException if role name exists', async () => {
      mockPrisma.role.findFirst.mockResolvedValueOnce({ id: '1', name: 'ADMIN' });
      await expect(service.create({ name: 'ADMIN' }, 'user1')).rejects.toThrow(ConflictException);
    });

    it('should create role successfully', async () => {
      mockPrisma.role.findFirst.mockResolvedValueOnce(null);
      mockPrisma.role.create.mockResolvedValueOnce({ id: '1', name: 'ADMIN' });
      const res = await service.create({ name: 'ADMIN', permission_ids: ['p1'] }, 'user1');
      expect(res.id).toBe('1');
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException when renaming system role', async () => {
      mockPrisma.role.findFirst.mockResolvedValueOnce({ id: '1', name: 'ADMIN', is_system: true });
      await expect(service.update('1', { name: 'NEW_ADMIN' }, 'user1')).rejects.toThrow(ForbiddenException);
    });

    it('should allow updating description of system role', async () => {
      mockPrisma.role.findFirst.mockResolvedValueOnce({ id: '1', name: 'ADMIN', is_system: true, description: 'old' });
      mockPrisma.role.update.mockResolvedValueOnce({ id: '1', name: 'ADMIN', is_system: true, description: 'new' });
      const res = await service.update('1', { description: 'new' }, 'user1');
      expect(res.description).toBe('new');
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException if deleting system role', async () => {
      mockPrisma.role.findFirst.mockResolvedValueOnce({ id: '1', name: 'ADMIN', is_system: true });
      await expect(service.remove('1', 'user1')).rejects.toThrow(ForbiddenException);
    });

    it('should soft delete normal role', async () => {
      mockPrisma.role.findFirst.mockResolvedValueOnce({ id: '1', name: 'NORMAL', is_system: false });
      mockPrisma.role.update.mockResolvedValueOnce({ id: '1', deleted_at: new Date() });
      const res = await service.remove('1', 'user1');
      expect(res.success).toBe(true);
    });
  });
});
