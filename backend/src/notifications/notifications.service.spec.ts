import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { DatabaseService } from '../database/database.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('Notifications Module', () => {
  let service: NotificationsService;
  let processor: NotificationsProcessor;
  let prisma: DatabaseService;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-1' })
  };

  const mockPrisma = {
    notification: {
      findMany: jest.fn().mockResolvedValue([{ id: 'notif-1', title: 'Test' }]),
      create: jest.fn().mockResolvedValue({ id: 'notif-2' })
    },
    notificationLog: {
      create: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        NotificationsProcessor,
        { provide: DatabaseService, useValue: mockPrisma },
        { provide: getQueueToken('notifications'), useValue: mockQueue }
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    processor = module.get<NotificationsProcessor>(NotificationsProcessor);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should queue a notification', async () => {
    const res = await service.queueNotification({
      user_id: 'user1',
      title: 'Alert',
      message: 'System down',
      type: 'ALARM',
      channels: ['IN_APP', 'TELEGRAM']
    });
    expect(mockQueue.add).toHaveBeenCalledWith('send-notification', expect.any(Object), expect.any(Object));
    expect(res.success).toBe(true);
  });

  it('should process a notification job', async () => {
    const mockJob = {
      id: 'job-1',
      data: {
        user_id: 'user1',
        title: 'Alert',
        message: 'System down',
        type: 'ALARM',
        channels: ['IN_APP', 'EMAIL', 'TELEGRAM', 'WHATSAPP']
      }
    } as any;

    const res = await processor.process(mockJob);
    expect(prisma.notification.create).toHaveBeenCalled();
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'SUCCESS' })
    });
    expect(res.status).toBe('delivered');
  });

  it('should get in-app notifications', async () => {
    const res = await service.getInAppNotifications('user1');
    expect(prisma.notification.findMany).toHaveBeenCalled();
    expect(res.length).toBe(1);
  });
});
