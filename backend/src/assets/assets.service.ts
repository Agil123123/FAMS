import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: DatabaseService) {}

  async getTypes() {
    return this.prisma.assetType.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' }
    });
  }

  async create(createAssetDto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: createAssetDto,
    });
  }

  async findAll() {
    return this.prisma.asset.findMany({
      where: { deleted_at: null },
      include: {
        asset_type: true,
        vendor: true,
      }
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, deleted_at: null },
      include: {
        asset_type: true,
        vendor: true,
      }
    });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    const asset = await this.findOne(id);
    return this.prisma.asset.update({
      where: { id: asset.id },
      data: updateAssetDto,
    });
  }

  async remove(id: string) {
    const asset = await this.findOne(id);
    return this.prisma.asset.update({
      where: { id: asset.id },
      data: { deleted_at: new Date() },
    });
  }

  async getPhotos(id: string) {
    return this.prisma.assetPhoto.findMany({
      where: { asset_id: id, deleted_at: null },
      orderBy: { created_at: 'desc' }
    });
  }

  async getDocuments(id: string) {
    return this.prisma.assetDocument.findMany({
      where: { asset_id: id, deleted_at: null },
      orderBy: { created_at: 'desc' }
    });
  }

  async getHistory(id: string) {
    return this.prisma.assetHistory.findMany({
      where: { asset_id: id, deleted_at: null },
      orderBy: { created_at: 'desc' }
    });
  }
}
