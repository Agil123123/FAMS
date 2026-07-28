import { Injectable } from '@nestjs/common';
import { CreateFiberSpliceDto } from './dto/create-fiber-splice.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FiberSplicesService {
  constructor(private prisma: DatabaseService) {}

  async create(createFiberSpliceDto: CreateFiberSpliceDto) {
    return this.prisma.fiberSplice.create({
      data: createFiberSpliceDto,
    });
  }

  async findAll() {
    return this.prisma.fiberSplice.findMany({
      where: { deleted_at: null },
      include: {
        fiber_core: {
          include: {
            fiber_cable: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }
}
