import { Test, TestingModule } from '@nestjs/testing';
import { SystemService } from './system.service';
import { DatabaseService } from '../database/database.service';

describe('SystemService', () => {
  let service: SystemService;

  const mockPrisma = {
    $queryRaw: jest.fn().mockResolvedValue([1]),
    setting: {
      findMany: jest.fn().mockResolvedValue([
        { key: 'maintenance_mode', value: 'false' },
      ]),
      upsert: jest.fn().mockImplementation((args) => Promise.resolve({
        key: args.where.key,
        value: args.update.value,
        group: args.update.group,
      })),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SystemService>(SystemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return healthy status if DB is up', async () => {
      const result = await service.getHealth();
      expect(result.status).toBe('healthy');
      expect(result.components.database.status).toBe('healthy');
      expect(result.components.redis.status).toBe('healthy');
    });

    it('should return degraded status if DB is down', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB connection failed'));
      const result = await service.getHealth();
      expect(result.status).toBe('degraded');
      expect(result.components.database.status).toBe('unhealthy');
    });
  });

  describe('getSettings', () => {
    it('should return a list of settings', async () => {
      const result = await service.getSettings();
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('maintenance_mode');
    });
  });

  describe('updateSettings', () => {
    it('should update multiple settings', async () => {
      const result = await service.updateSettings([
        { key: 'maintenance_mode', value: 'true' },
        { key: 'theme', value: 'dark' },
      ]);
      expect(result).toHaveLength(2);
      expect(mockPrisma.setting.upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('triggerBackup', () => {
    it('should return backup success response', async () => {
      const result = await service.triggerBackup();
      expect(result.status).toBe('success');
      expect(result.backup_id).toBeDefined();
    });
  });
});
