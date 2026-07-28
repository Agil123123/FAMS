import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: DatabaseService) {}

  async getAuditLogs(params: {
    skip?: number;
    take?: number;
    module?: string;
    action?: string;
    userId?: string;
    entityId?: string;
    entityType?: string;
  }) {
    const { skip = 0, take = 50, module, action, userId, entityId, entityType } = params;

    const where: any = {};
    if (module) where.module = module;
    if (action) where.action = action;
    if (userId) where.user_id = userId;
    if (entityId) where.entity_id = entityId;
    if (entityType) where.entity_type = entityType;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    // To provide user information without Prisma relations, we map it manually if needed, 
    // or just return the user_id. The prototype can just return the user_id.
    return { data, total, skip: Number(skip), take: Number(take) };
  }
}
