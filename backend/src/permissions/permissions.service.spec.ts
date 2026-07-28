import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { DatabaseService } from '../database/database.service';

describe('PermissionsService', () => {
  let service: PermissionsService;

  const mockPrisma = {
    permission: {
      findMany: jest.fn().mockResolvedValue([{ id: '1', name: 'user.read', module: 'user_management' }]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: DatabaseService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const result = await service.findAll();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('user.read');
      expect(mockPrisma.permission.findMany).toHaveBeenCalled();
    });
  });
});
