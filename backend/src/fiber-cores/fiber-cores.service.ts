import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateFiberCoreDto } from './dto/update-fiber-core.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FiberCoresService {
  constructor(private prisma: DatabaseService) {}

  async findAll() {
    return this.prisma.fiberCore.findMany({
      where: { deleted_at: null },
      include: {
        fiber_cable: true,
        fiber_splices: true,
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const core = await this.prisma.fiberCore.findFirst({
      where: { id, deleted_at: null },
      include: {
        fiber_cable: true,
        fiber_splices: true,
      }
    });
    if (!core) {
      throw new NotFoundException(`Fiber Core with ID ${id} not found`);
    }
    return core;
  }

  async update(id: string, updateFiberCoreDto: UpdateFiberCoreDto) {
    const core = await this.findOne(id);
    return this.prisma.fiberCore.update({
      where: { id: core.id },
      data: updateFiberCoreDto,
    });
  }
}
