import { Test, TestingModule } from '@nestjs/testing';
import { FiberSplicesService } from './fiber-splices.service';
import { DatabaseService } from '../database/database.service';

describe('FiberSplicesService', () => {
  let service: FiberSplicesService;
  let prisma: DatabaseService;

  const mockSplice = {
    id: 'test-id',
    fiber_core_id: 'core-id',
    attenuation: 0.15,
    deleted_at: null,
  };

  const mockPrisma = {
    fiberSplice: {
      create: jest.fn().mockResolvedValue(mockSplice),
      findMany: jest.fn().mockResolvedValue([mockSplice]),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiberSplicesService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FiberSplicesService>(FiberSplicesService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Fiber Splice', async () => {
    const dto = { fiber_core_id: 'core-id', attenuation: 0.15 };
    expect(await service.create(dto)).toEqual(mockSplice);
    expect(prisma.fiberSplice.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should return all Fiber Splices', async () => {
    expect(await service.findAll()).toEqual([mockSplice]);
  });
});
