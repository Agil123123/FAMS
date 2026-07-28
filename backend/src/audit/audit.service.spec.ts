import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { DatabaseService } from '../database/database.service';

describe('AuditService', () => {
  let service: AuditService;

  const mockPrisma = {
    auditLog: {
      findMany: jest.fn().mockResolvedValue([
        { id: '1', module: 'System', action: 'CREATE' },
      ]),
      count: jest.fn().mockResolvedValue(1),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuditLogs', () => {
    it('should return audit logs with pagination', async () => {
      const result = await service.getAuditLogs({ skip: 0, take: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: { created_at: 'desc' },
      }));
    });

    it('should filter audit logs by module', async () => {
      await service.getAuditLogs({ module: 'System' });
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { module: 'System' },
      }));
    });
  });
});
