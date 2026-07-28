import { Test, TestingModule } from '@nestjs/testing';
import { GisService } from './gis.service';
import { DatabaseService } from '../database/database.service';

describe('GisService', () => {
  let service: GisService;
  let prisma: DatabaseService;

  const mockPrisma = {
    $queryRawUnsafe: jest.fn().mockResolvedValue([
      { id: '1', name: 'Test', asset_code: 'CODE', geometry: '{"type":"Point","coordinates":[106,-6]}' }
    ])
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GisService>(GisService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return assets as FeatureCollection', async () => {
    const result = await service.getAssets();
    expect(result.type).toBe('FeatureCollection');
    // It queries 5 tables, so 5 items are pushed
    expect(result.features.length).toBe(5);
    expect(result.features[0].type).toBe('Feature');
    expect(result.features[0].properties.name).toBe('Test');
  });

  it('should return customers as FeatureCollection', async () => {
    const result = await service.getCustomers();
    expect(result.type).toBe('FeatureCollection');
    expect(result.features.length).toBe(1);
    expect(result.features[0].properties.type).toBe('Customer');
  });
});
