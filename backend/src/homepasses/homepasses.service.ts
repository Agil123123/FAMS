import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateHomepassDto } from './dto/create-homepass.dto';
import { UpdateHomepassDto } from './dto/update-homepass.dto';

@Injectable()
export class HomepassesService {
  constructor(private prisma: DatabaseService) {}

  async create(createHomepassDto: CreateHomepassDto, userId: string) {
    const { name, address, latitude, longitude } = createHomepassDto;
    
    // First, insert without geometry using standard Prisma
    const homepass = await this.prisma.homepass.create({
      data: {
        name,
        address,
        created_by: userId,
      },
    });

    // Second, execute PostGIS geometry update
    await this.prisma.$executeRawUnsafe(`
      UPDATE homepasses 
      SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)
      WHERE id = $3::uuid
    `, longitude, latitude, homepass.id);

    return this.findOne(homepass.id);
  }

  async findAll() {
    const rawResult = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, address, ST_X(geom) as longitude, ST_Y(geom) as latitude, 
             created_at, updated_at
      FROM homepasses 
      WHERE deleted_at IS NULL
    `);
    
    return rawResult.map(hp => ({
      ...hp,
      longitude: hp.longitude || 0,
      latitude: hp.latitude || 0
    }));
  }

  async findOne(id: string) {
    const rawResult = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, address, ST_X(geom) as longitude, ST_Y(geom) as latitude, 
             created_at, updated_at
      FROM homepasses 
      WHERE id = $1::uuid AND deleted_at IS NULL
    `, id);

    if (!rawResult || rawResult.length === 0) {
      throw new NotFoundException(`Homepass with ID ${id} not found`);
    }

    const hp = rawResult[0];
    return {
      ...hp,
      longitude: hp.longitude || 0,
      latitude: hp.latitude || 0
    };
  }

  async update(id: string, updateHomepassDto: UpdateHomepassDto, userId: string) {
    const existing = await this.findOne(id); // Throws if not found

    const name = updateHomepassDto.name ?? existing.name;
    const address = updateHomepassDto.address ?? existing.address;
    const latitude = updateHomepassDto.latitude ?? existing.latitude;
    const longitude = updateHomepassDto.longitude ?? existing.longitude;

    await this.prisma.homepass.update({
      where: { id },
      data: {
        name,
        address,
        updated_by: userId,
      }
    });

    if (updateHomepassDto.latitude !== undefined || updateHomepassDto.longitude !== undefined) {
      await this.prisma.$executeRawUnsafe(`
        UPDATE homepasses 
        SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)
        WHERE id = $3::uuid
      `, longitude, latitude, id);
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id); // Throws if not found
    
    return this.prisma.homepass.update({
      where: { id },
      data: { 
        deleted_at: new Date(),
        updated_by: userId
      },
    });
  }
}
