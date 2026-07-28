// ==========================================================
// Users Service
// Business logic for user operations
// ==========================================================

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    return this.usersRepository.findAll(params);
  }

  async create(data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    created_by?: string;
  }) {
    // Check duplicate email
    const existingEmail = await this.usersRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check duplicate username
    const existingUsername = await this.usersRepository.findByUsername(
      data.username,
    );
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await argon2.hash(data.password);

    return this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async update(
    id: string,
    data: {
      full_name?: string;
      phone?: string;
      avatar?: string;
      updated_by?: string;
    },
  ) {
    await this.findById(id); // ensure exists
    return this.usersRepository.update(id, data);
  }

  async softDelete(id: string, deletedBy: string) {
    await this.findById(id); // ensure exists
    return this.usersRepository.softDelete(id, deletedBy);
  }
}
