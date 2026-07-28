import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DatabaseService } from '../database/database.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    customer: {
      count: jest.fn().mockResolvedValue(100),
    },
    homepass: {
      count: jest.fn().mockResolvedValue(200),
    },
    workOrder: {
      groupBy: jest.fn().mockResolvedValue([
        { status: 'OPEN', _count: { _all: 5 } },
        { status: 'CLOSED', _count: { _all: 10 } },
      ]),
    },
    alarm: {
      groupBy: jest.fn().mockResolvedValue([
        { severity: 'CRITICAL', _count: { _all: 2 } },
        { severity: 'MINOR', _count: { _all: 8 } },
      ]),
    },
    workOrderHistory: {
      findMany: jest.fn().mockResolvedValue([
        { 
          id: '1', 
          status: 'COMPLETED', 
          notes: 'Done', 
          created_at: new Date(),
          work_order: { title: 'Install ODP', id: 'wo-1' }
        }
      ]),
    },
    olt: { count: jest.fn().mockResolvedValue(5) },
    odc: { count: jest.fn().mockResolvedValue(20) },
    odp: { count: jest.fn().mockResolvedValue(100) },
    splitter: {
      findMany: jest.fn().mockResolvedValue([
        { splitter_type: { ratio_out: 8 } },
        { splitter_type: { ratio_out: 16 } },
      ])
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: DatabaseService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getKpis', () => {
    it('should return aggregated KPIs', async () => {
      const result = await service.getKpis();
      expect(result.totalCustomers).toBe(100);
      expect(result.totalHomepasses).toBe(200);
      expect(result.totalOpenWorkOrders).toBe(5);
      expect(result.criticalAlarms).toBe(2);
    });
  });

  describe('getActivity', () => {
    it('should return mapped recent activities', async () => {
      const result = await service.getActivity();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Work Order COMPLETED');
    });
  });

  describe('getCapacity', () => {
    it('should return calculated capacity', async () => {
      const result = await service.getCapacity();
      expect(result.olts).toBe(5);
      expect(result.totalPorts).toBe(24);
      expect(result.usedPorts).toBe(100); // 100 customers mocked
    });
  });

  describe('getAlarms', () => {
    it('should return alarm counts grouped by severity', async () => {
      const result = await service.getAlarms();
      expect(result.length).toBe(2);
      expect(result[0].severity).toBe('CRITICAL');
    });
  });
});
