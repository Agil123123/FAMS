import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFiberCableDto } from './dto/create-fiber-cable.dto';
import { UpdateFiberCableDto } from './dto/update-fiber-cable.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FiberCablesService {
  constructor(private prisma: DatabaseService) {}

  async create(createFiberCableDto: CreateFiberCableDto) {
    const cable = await this.prisma.fiberCable.create({
      data: createFiberCableDto,
      include: {
        cable_type: true
      }
    });

    // In a real scenario, you'd parse `cable_type.name` or have a `core_count` field on CableType
    // to dynamically generate FiberCores here. We simulate generation of 12 cores.
    const coreCount = 12;
    const coresData = Array.from({ length: coreCount }).map((_, idx) => ({
      fiber_cable_id: cable.id,
      core_index: idx + 1,
      color_code: `Color-${idx + 1}`
    }));

    await this.prisma.fiberCore.createMany({
      data: coresData
    });

    return this.findOne(cable.id);
  }

  async findAll() {
    return this.prisma.fiberCable.findMany({
      where: { deleted_at: null },
      include: {
        cable_type: true,
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const cable = await this.prisma.fiberCable.findFirst({
      where: { id, deleted_at: null },
      include: {
        cable_type: true,
        fiber_cores: {
          orderBy: { core_index: 'asc' }
        }
      }
    });
    if (!cable) {
      throw new NotFoundException(`Fiber Cable with ID ${id} not found`);
    }
    return cable;
  }

  async update(id: string, updateFiberCableDto: UpdateFiberCableDto) {
    const cable = await this.findOne(id);
    return this.prisma.fiberCable.update({
      where: { id: cable.id },
      data: updateFiberCableDto,
    });
  }

  async remove(id: string) {
    const cable = await this.findOne(id);
    return this.prisma.fiberCable.update({
      where: { id: cable.id },
      data: { deleted_at: new Date() },
    });
  }
}
