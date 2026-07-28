import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOltDto } from './dto/create-olt.dto';
import { UpdateOltDto } from './dto/update-olt.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OltsService {
  constructor(private prisma: DatabaseService) {}

  async create(createOltDto: CreateOltDto) {
    return this.prisma.olt.create({
      data: createOltDto,
    });
  }

  async findAll() {
    return this.prisma.olt.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const olt = await this.prisma.olt.findFirst({
      where: { id, deleted_at: null },
    });
    if (!olt) {
      throw new NotFoundException(`OLT with ID ${id} not found`);
    }
    return olt;
  }

  async update(id: string, updateOltDto: UpdateOltDto) {
    const olt = await this.findOne(id);
    return this.prisma.olt.update({
      where: { id: olt.id },
      data: updateOltDto,
    });
  }

  async remove(id: string) {
    const olt = await this.findOne(id);
    return this.prisma.olt.update({
      where: { id: olt.id },
      data: { deleted_at: new Date() },
    });
  }
}
