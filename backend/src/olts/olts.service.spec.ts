import { Test, TestingModule } from '@nestjs/testing';
import { OltsService } from './olts.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('OltsService', () => {
  let service: OltsService;
  let prisma: DatabaseService;

  const mockOlt = {
    id: 'test-id',
    asset_code: 'OLT-01',
    name: 'Main OLT Hub',
    ip_address: '192.168.1.1',
    deleted_at: null,
  };

  const mockPrisma = {
    olt: {
      create: jest.fn().mockResolvedValue(mockOlt),
      findMany: jest.fn().mockResolvedValue([mockOlt]),
      findFirst: jest.fn().mockResolvedValue(mockOlt),
      update: jest.fn().mockResolvedValue({ ...mockOlt, name: 'Updated' }),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OltsService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OltsService>(OltsService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an OLT', async () => {
    const dto = { asset_code: 'OLT-01', name: 'Main OLT Hub' };
    expect(await service.create(dto)).toEqual(mockOlt);
    expect(prisma.olt.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should return all OLTs', async () => {
    expect(await service.findAll()).toEqual([mockOlt]);
  });

  it('should return an OLT by id', async () => {
    expect(await service.findOne('test-id')).toEqual(mockOlt);
  });

  it('should throw NotFoundException if OLT not found', async () => {
    (prisma.olt.findFirst as jest.Mock).mockResolvedValueOnce(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should update an OLT', async () => {
    const updateDto = { name: 'Updated' };
    const result = await service.update('test-id', updateDto);
    expect(result.name).toBe('Updated');
    expect(prisma.olt.update).toHaveBeenCalled();
  });

  it('should soft delete an OLT', async () => {
    await service.remove('test-id');
    expect(prisma.olt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'test-id' },
        data: { deleted_at: expect.any(Date) }
      })
    );
  });
});
