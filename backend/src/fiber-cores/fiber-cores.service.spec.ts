import { Test, TestingModule } from '@nestjs/testing';
import { FiberCoresService } from './fiber-cores.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('FiberCoresService', () => {
  let service: FiberCoresService;
  let prisma: DatabaseService;

  const mockCore = {
    id: 'test-id',
    fiber_cable_id: 'cable-id',
    core_index: 1,
    color_code: 'Red',
    deleted_at: null,
  };

  const mockPrisma = {
    fiberCore: {
      findMany: jest.fn().mockResolvedValue([mockCore]),
      findFirst: jest.fn().mockResolvedValue(mockCore),
      update: jest.fn().mockResolvedValue({ ...mockCore, color_code: 'Blue' }),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiberCoresService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FiberCoresService>(FiberCoresService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all Fiber Cores', async () => {
    expect(await service.findAll()).toEqual([mockCore]);
  });

  it('should return a Fiber Core by id', async () => {
    expect(await service.findOne('test-id')).toEqual(mockCore);
  });

  it('should throw NotFoundException if Fiber Core not found', async () => {
    (prisma.fiberCore.findFirst as jest.Mock).mockResolvedValueOnce(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should update a Fiber Core', async () => {
    const updateDto = { color_code: 'Blue' };
    const result = await service.update('test-id', updateDto);
    expect(result.color_code).toBe('Blue');
    expect(prisma.fiberCore.update).toHaveBeenCalled();
  });
});
