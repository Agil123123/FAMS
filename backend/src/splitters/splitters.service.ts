import { Injectable } from '@nestjs/common';
import { CreateSplitterDto } from './dto/create-splitter.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SplittersService {
  constructor(private prisma: DatabaseService) {}

  async create(createSplitterDto: CreateSplitterDto) {
    return this.prisma.splitter.create({
      data: createSplitterDto,
    });
  }

  async findAll() {
    return this.prisma.splitter.findMany({
      where: { deleted_at: null },
      include: {
        odp: true,
        splitter_type: true,
      },
      orderBy: { created_at: 'desc' }
    });
  }
}
