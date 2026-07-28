// ==========================================================
// Roles Repository
// ==========================================================

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RolesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.role.findMany({
      where: { deleted_at: null },
      include: {
        role_permissions: {
          include: { permission: true },
        },
        _count: { select: { user_roles: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.db.role.findFirst({
      where: { id, deleted_at: null },
      include: {
        role_permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async findByName(name: string) {
    return this.db.role.findFirst({
      where: { name, deleted_at: null },
    });
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    // Remove existing permissions
    await this.db.rolePermission.deleteMany({
      where: { role_id: roleId },
    });

    // Assign new permissions
    await this.db.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
      })),
    });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return this.db.userRole.upsert({
      where: {
        user_id_role_id: { user_id: userId, role_id: roleId },
      },
      update: {},
      create: { user_id: userId, role_id: roleId },
    });
  }
}
