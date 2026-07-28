// ==========================================================
// Users Repository
// Data access layer for users table
// ==========================================================

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string) {
    return this.db.user.findFirst({
      where: { id, deleted_at: null },
      include: {
        user_roles: {
          include: {
            role: {
              include: {
                role_permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.db.user.findFirst({
      where: { email, deleted_at: null },
    });
  }

  async findByUsername(username: string) {
    return this.db.user.findFirst({
      where: { username, deleted_at: null },
    });
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const { page, limit, search, sort = 'created_at', order = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deleted_at: null,
      ...(search && {
        OR: [
          { full_name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: {
          id: true,
          username: true,
          email: true,
          full_name: true,
          phone: true,
          avatar: true,
          status: true,
          last_login: true,
          created_at: true,
          user_roles: {
            include: { role: true },
          },
        },
      }),
      this.db.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: Prisma.UserCreateInput) {
    return this.db.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.db.user.update({ where: { id }, data });
  }

  async softDelete(id: string, deletedBy: string) {
    return this.db.user.update({
      where: { id },
      data: { deleted_at: new Date(), updated_by: deletedBy },
    });
  }
}
