import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';
import { DatabaseService } from '../database/database.service';
import { RedisService } from './redis.service';

describe('MonitoringService', () => {
  let service: MonitoringService;
  let prisma: DatabaseService;
  let redis: RedisService;

  const mockPrisma = {
    alarm: {
      count: jest.fn().mockResolvedValue(5),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 'alarm-1', is_resolved: false }),
      update: jest.fn().mockResolvedValue({ id: 'alarm-1', is_resolved: true }),
    },
    deviceStatus: {
      count: jest.fn().mockResolvedValue(2),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'status-1' })
    },
    workOrder: {
      count: jest.fn().mockResolvedValue(10)
    }
  };

  const mockRedis = {
    setCache: jest.fn().mockResolvedValue(undefined)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: DatabaseService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
    prisma = module.get<DatabaseService>(DatabaseService);
    redis = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get dashboard aggregates', async () => {
    const result = await service.getDashboardAggregate();
    expect(result.active_alarms).toBe(5);
    expect(result.offline_devices).toBe(2);
    expect(result.active_work_orders).toBe(10);
  });

  it('should process heartbeat via redis and prisma', async () => {
    await service.processHeartbeat({ device_type: 'ONU', device_id: 'uuid-1', status: 'ONLINE' });
    expect(redis.setCache).toHaveBeenCalledWith('heartbeat:ONU:uuid-1', expect.any(Object), 600);
    expect(prisma.deviceStatus.create).toHaveBeenCalled();
  });

  it('should resolve an alarm', async () => {
    await service.resolveAlarm('alarm-1', 'user1');
    expect(prisma.alarm.update).toHaveBeenCalledWith({
      where: { id: 'alarm-1' },
      data: { is_resolved: true, updated_by: 'user1' }
    });
  });
});
