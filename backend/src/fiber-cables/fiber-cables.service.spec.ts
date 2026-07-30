import { Test, TestingModule } from '@nestjs/testing';
import { FiberCablesService } from './fiber-cables.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('FiberCablesService', () => {
  let service: FiberCablesService;
  let prisma: DatabaseService;

  const mockCable = {
    id: 'test-id',
    asset_code: 'CBL-01',
    cable_type_id: 'type-id',
    length_meters: 1500,
    deleted_at: null,
  };

  const mockPrisma = {
    fiberCable: {
      create: jest.fn().mockResolvedValue(mockCable),
      findMany: jest.fn().mockResolvedValue([mockCable]),
      findFirst: jest.fn().mockResolvedValue(mockCable),
      update: jest.fn().mockResolvedValue({ ...mockCable, length_meters: 2000 }),
    },
    fiberCore: {
      createMany: jest.fn().mockResolvedValue({ count: 12 }),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiberCablesService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FiberCablesService>(FiberCablesService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Fiber Cable and auto-generate cores', async () => {
    const dto = { asset_code: 'CBL-01', cable_type_id: 'type-id', length_meters: 1500 };
    expect(await service.create(dto)).toEqual(mockCable);
    expect(prisma.fiberCable.create).toHaveBeenCalled();
    expect(prisma.fiberCore.createMany).toHaveBeenCalled();
  });

  it('should return all Fiber Cables', async () => {
    expect(await service.findAll()).toEqual([mockCable]);
  });

  it('should return a Fiber Cable by id', async () => {
    expect(await service.findOne('test-id')).toEqual(mockCable);
  });

  it('should throw NotFoundException if Fiber Cable not found', async () => {
    (prisma.fiberCable.findFirst as jest.Mock).mockResolvedValueOnce(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should update a Fiber Cable', async () => {
    const updateDto = { length_meters: 2000 };
    const result = await service.update('test-id', updateDto);
    expect(result.length_meters).toBe(2000);
    expect(prisma.fiberCable.update).toHaveBeenCalled();
  });

  it('should soft delete a Fiber Cable', async () => {
    await service.remove('test-id');
    expect(prisma.fiberCable.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'test-id' },
        data: { deleted_at: expect.any(Date) }
      })
    );
  });
});
