import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersService } from './work-orders.service';
import { DatabaseService } from '../database/database.service';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  let prisma: DatabaseService;

  const mockWorkOrder = {
    id: '1',
    title: 'Install Fiber',
    status: 'OPEN',
    tasks: [],
    photos: [],
    histories: []
  };

  const mockPrisma = {
    workOrder: {
      create: jest.fn().mockResolvedValue(mockWorkOrder),
      findMany: jest.fn().mockResolvedValue([mockWorkOrder]),
      findUnique: jest.fn().mockResolvedValue(mockWorkOrder),
      update: jest.fn().mockResolvedValue({ ...mockWorkOrder, status: 'IN_PROGRESS' }),
    },
    workOrderHistory: {
      create: jest.fn()
    },
    workOrderTask: {
      create: jest.fn(),
      findUnique: jest.fn().mockResolvedValue({ id: 'task-1', is_completed: false }),
      update: jest.fn()
    },
    workOrderPhoto: {
      create: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a work order and initial history', async () => {
    const result = await service.create({ title: 'New WO' }, 'user1');
    expect(prisma.workOrder.create).toHaveBeenCalled();
    expect(prisma.workOrderHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'OPEN' })
    });
    expect(result.id).toBe('1');
  });

  it('should update status and append history', async () => {
    const result = await service.updateStatus('1', { status: 'IN_PROGRESS' }, 'user1');
    expect(prisma.workOrder.update).toHaveBeenCalled();
    expect(prisma.workOrderHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'IN_PROGRESS' })
    });
    expect(result.id).toBe('1');
  });

  it('should toggle a task', async () => {
    await service.toggleTask('task-1', true, 'user1');
    expect(prisma.workOrderTask.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { is_completed: true, updated_by: 'user1' }
    });
  });
});
