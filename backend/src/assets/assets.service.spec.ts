import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('AssetsService', () => {
  let service: AssetsService;
  let prisma: DatabaseService;

  const mockAsset = {
    id: 'test-id',
    asset_code: 'A-01',
    name: 'Test Asset',
    asset_type_id: 'type-id',
    vendor_id: 'vendor-id',
    status: 'ACTIVE',
    deleted_at: null,
  };

  const mockPrisma = {
    asset: {
      create: jest.fn().mockResolvedValue(mockAsset),
      findMany: jest.fn().mockResolvedValue([mockAsset]),
      findFirst: jest.fn().mockResolvedValue(mockAsset),
      update: jest.fn().mockResolvedValue({ ...mockAsset, name: 'Updated' }),
    },
    assetPhoto: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    assetDocument: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    assetHistory: {
      findMany: jest.fn().mockResolvedValue([]),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an asset', async () => {
    const dto = { asset_code: 'A-01', name: 'Test Asset', asset_type_id: 'type-id' };
    expect(await service.create(dto)).toEqual(mockAsset);
    expect(prisma.asset.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should return all assets', async () => {
    expect(await service.findAll()).toEqual([mockAsset]);
  });

  it('should return an asset by id', async () => {
    expect(await service.findOne('test-id')).toEqual(mockAsset);
  });

  it('should throw NotFoundException if asset not found', async () => {
    (prisma.asset.findFirst as jest.Mock).mockResolvedValueOnce(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should update an asset', async () => {
    const updateDto = { name: 'Updated' };
    const result = await service.update('test-id', updateDto);
    expect(result.name).toBe('Updated');
    expect(prisma.asset.update).toHaveBeenCalled();
  });

  it('should soft delete an asset', async () => {
    await service.remove('test-id');
    expect(prisma.asset.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'test-id' },
        data: { deleted_at: expect.any(Date) }
      })
    );
  });

  it('should return asset photos', async () => {
    expect(await service.getPhotos('test-id')).toEqual([]);
  });

  it('should return asset documents', async () => {
    expect(await service.getDocuments('test-id')).toEqual([]);
  });

  it('should return asset histories', async () => {
    expect(await service.getHistory('test-id')).toEqual([]);
  });
});
