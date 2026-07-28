import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: DatabaseService) {}

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { name: 'asc' }
      ]
    });
  }
}
