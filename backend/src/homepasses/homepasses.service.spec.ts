import { Test, TestingModule } from '@nestjs/testing';
import { HomepassesService } from './homepasses.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('HomepassesService', () => {
  let service: HomepassesService;
  let prisma: DatabaseService;

  const mockPrisma = {
    homepass: {
      create: jest.fn().mockResolvedValue({ id: '1', name: 'Test HP', address: '123 Test St' }),
      update: jest.fn().mockResolvedValue({ id: '1', deleted_at: new Date() }),
    },
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    $queryRawUnsafe: jest.fn().mockResolvedValue([
      { id: '1', name: 'Test HP', address: '123 Test St', longitude: 106.8, latitude: -6.2 }
    ])
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomepassesService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HomepassesService>(HomepassesService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a homepass with geometry', async () => {
    const dto = { name: 'Test HP', address: '123 Test St', latitude: -6.2, longitude: 106.8 };
    const result = await service.create(dto, 'user-1');
    expect(prisma.homepass.create).toHaveBeenCalled();
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('ST_SetSRID'), 
      106.8, -6.2, '1'
    );
    expect(result.id).toBe('1');
  });

  it('should find all homepasses', async () => {
    const result = await service.findAll();
    expect(result.length).toBe(1);
    expect(result[0].longitude).toBe(106.8);
  });

  it('should throw NotFoundException for invalid ID', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });
});
