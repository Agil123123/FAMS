import { Test, TestingModule } from '@nestjs/testing';
import { SplittersService } from './splitters.service';
import { DatabaseService } from '../database/database.service';

describe('SplittersService', () => {
  let service: SplittersService;
  let prisma: DatabaseService;

  const mockSplitter = {
    id: 'test-id',
    asset_code: 'SPL-01',
    odp_id: 'odp-id',
    splitter_type_id: 'type-id',
    deleted_at: null,
  };

  const mockPrisma = {
    splitter: {
      create: jest.fn().mockResolvedValue(mockSplitter),
      findMany: jest.fn().mockResolvedValue([mockSplitter]),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SplittersService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SplittersService>(SplittersService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Splitter', async () => {
    const dto = { asset_code: 'SPL-01', odp_id: 'odp-id', splitter_type_id: 'type-id' };
    expect(await service.create(dto)).toEqual(mockSplitter);
    expect(prisma.splitter.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should return all Splitters', async () => {
    expect(await service.findAll()).toEqual([mockSplitter]);
  });
});
