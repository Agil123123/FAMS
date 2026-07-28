import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { DatabaseService } from '../database/database.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: DatabaseService;

  const mockPrisma = {
    asset: { findMany: jest.fn().mockResolvedValue([{ asset_code: 'A1', name: 'ONU1', status: 'ACTIVE' }]) },
    alarm: { findMany: jest.fn().mockResolvedValue([{ device_type: 'ONU', severity: 'HIGH', message: 'Fail' }]) },
    workOrder: { findMany: jest.fn().mockResolvedValue([{ title: 'Fix ONU', status: 'OPEN' }]) },
    job: { 
      create: jest.fn().mockResolvedValue({ id: 'job-1' }),
      findMany: jest.fn().mockResolvedValue([{ id: 'job-1' }]),
      update: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate CSV', async () => {
    const csv = await service.generateCsv();
    expect(typeof csv).toBe('string');
    expect(csv).toContain('Device');
  });

  it('should generate Excel', async () => {
    const buffer = await service.generateExcel();
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it('should generate PDF', async () => {
    const buffer = await service.generatePdf();
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it('should schedule report', async () => {
    const res = await service.scheduleReport('daily', 'test@test.com');
    expect(prisma.job.create).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it('should run daily reports', async () => {
    await service.runDailyReports();
    expect(prisma.job.findMany).toHaveBeenCalled();
    expect(prisma.job.update).toHaveBeenCalled();
  });
});
