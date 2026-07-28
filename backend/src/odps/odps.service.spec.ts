import { Test, TestingModule } from '@nestjs/testing';
import { OdpsService } from './odps.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('OdpsService', () => {
  let service: OdpsService;
  let prisma: DatabaseService;

  const mockOdp = {
    id: 'test-id',
    asset_code: 'ODP-01',
    name: 'Pole 14 Splitter',
    closure_id: 'closure-id',
    deleted_at: null,
  };

  const mockPrisma = {
    odp: {
      create: jest.fn().mockResolvedValue(mockOdp),
      findMany: jest.fn().mockResolvedValue([mockOdp]),
      findFirst: jest.fn().mockResolvedValue(mockOdp),
      update: jest.fn().mockResolvedValue({ ...mockOdp, name: 'Updated' }),
    },
    splitter: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    customer: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdpsService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OdpsService>(OdpsService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an ODP', async () => {
    const dto = { asset_code: 'ODP-01', name: 'Pole 14 Splitter', closure_id: 'closure-id' };
    expect(await service.create(dto)).toEqual(mockOdp);
    expect(prisma.odp.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should return all ODPs', async () => {
    expect(await service.findAll()).toEqual([mockOdp]);
  });

  it('should return an ODP by id', async () => {
    expect(await service.findOne('test-id')).toEqual(mockOdp);
  });

  it('should throw NotFoundException if ODP not found', async () => {
    (prisma.odp.findFirst as jest.Mock).mockResolvedValueOnce(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should update an ODP', async () => {
    const updateDto = { name: 'Updated' };
    const result = await service.update('test-id', updateDto);
    expect(result.name).toBe('Updated');
    expect(prisma.odp.update).toHaveBeenCalled();
  });

  it('should soft delete an ODP', async () => {
    await service.remove('test-id');
    expect(prisma.odp.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'test-id' },
        data: { deleted_at: expect.any(Date) }
      })
    );
  });

  it('should return capacity calculation', async () => {
    (prisma.odp.findFirst as jest.Mock).mockResolvedValueOnce(mockOdp);
    const capacity = await service.getCapacity('test-id');
    expect(capacity).toHaveProperty('total_ports');
    expect(capacity).toHaveProperty('used_ports');
    expect(capacity).toHaveProperty('available_ports');
    expect(capacity).toHaveProperty('utilization_percentage');
  });
});
