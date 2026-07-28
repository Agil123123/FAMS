// ==========================================================
// Permissions Repository
// ==========================================================

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  async findByModule(module: string) {
    return this.db.permission.findMany({
      where: { module },
      orderBy: { action: 'asc' },
    });
  }

  async findByName(name: string) {
    return this.db.permission.findUnique({
      where: { name },
    });
  }
}
