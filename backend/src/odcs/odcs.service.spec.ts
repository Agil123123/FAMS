import { Test, TestingModule } from '@nestjs/testing';
import { OdcsService } from './odcs.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('OdcsService', () => {
  let service: OdcsService;
  let prisma: DatabaseService;

  const mockOdc = {
    id: 'test-id',
    asset_code: 'ODC-01',
    name: 'North Cabinet',
    pon_port_id: 'pon-id',
    deleted_at: null,
  };

  const mockPrisma = {
    odc: {
      create: jest.fn().mockResolvedValue(mockOdc),
      findMany: jest.fn().mockResolvedValue([mockOdc]),
      findFirst: jest.fn().mockResolvedValue(mockOdc),
      update: jest.fn().mockResolvedValue({ ...mockOdc, name: 'Updated' }),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdcsService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OdcsService>(OdcsService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an ODC', async () => {
    const dto = { asset_code: 'ODC-01', name: 'North Cabinet', pon_port_id: 'pon-id' };
    expect(await service.create(dto)).toEqual(mockOdc);
    expect(prisma.odc.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should return all ODCs', async () => {
    expect(await service.findAll()).toEqual([mockOdc]);
  });

  it('should return an ODC by id', async () => {
    expect(await service.findOne('test-id')).toEqual(mockOdc);
  });

  it('should throw NotFoundException if ODC not found', async () => {
    (prisma.odc.findFirst as jest.Mock).mockResolvedValueOnce(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should update an ODC', async () => {
    const updateDto = { name: 'Updated' };
    const result = await service.update('test-id', updateDto);
    expect(result.name).toBe('Updated');
    expect(prisma.odc.update).toHaveBeenCalled();
  });

  it('should soft delete an ODC', async () => {
    await service.remove('test-id');
    expect(prisma.odc.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'test-id' },
        data: { deleted_at: expect.any(Date) }
      })
    );
  });
});
