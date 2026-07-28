import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOdcDto } from './dto/create-odc.dto';
import { UpdateOdcDto } from './dto/update-odc.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OdcsService {
  constructor(private prisma: DatabaseService) {}

  async create(createOdcDto: CreateOdcDto) {
    return this.prisma.odc.create({
      data: createOdcDto,
    });
  }

  async findAll() {
    return this.prisma.odc.findMany({
      where: { deleted_at: null },
      include: {
        pon_port: {
          include: {
            olt: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const odc = await this.prisma.odc.findFirst({
      where: { id, deleted_at: null },
      include: {
        pon_port: {
          include: {
            olt: true
          }
        }
      }
    });
    if (!odc) {
      throw new NotFoundException(`ODC with ID ${id} not found`);
    }
    return odc;
  }

  async update(id: string, updateOdcDto: UpdateOdcDto) {
    const odc = await this.findOne(id);
    return this.prisma.odc.update({
      where: { id: odc.id },
      data: updateOdcDto,
    });
  }

  async remove(id: string) {
    const odc = await this.findOne(id);
    return this.prisma.odc.update({
      where: { id: odc.id },
      data: { deleted_at: new Date() },
    });
  }
}
