import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FiberLinkService {
  constructor(private prisma: DatabaseService) {}

  async create(body: any, userId: string) {
    const { from_odp_id, to_odp_id, from_port, to_port, cable_color, cable_core } = body;
    const id = await this.prisma.$executeRawUnsafe(
      `INSERT INTO odp_links (id, from_odp_id, to_odp_id, from_port, to_port, cable_color, cable_core, created_by, created_at, updated_at)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8::uuid, NOW(), NOW())`,
      uuidv4(), from_odp_id, to_odp_id, from_port || 1, to_port || 1, cable_color || null, cable_core || null, userId
    );
    return { success: true };
  }

  async getAll() {
    const links = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT ol.id, ol.from_odp_id, ol.to_odp_id, ol.from_port, ol.to_port,
             ol.cable_color, ol.cable_core, ol.status,
             fo.name as from_name, fo.asset_code as from_code,
             to_odp.name as to_name, to_odp.asset_code as to_code,
             ST_AsGeoJSON(fo.geom) as from_geom,
             ST_AsGeoJSON(to_odp.geom) as to_geom
      FROM odp_links ol
      JOIN odps fo ON fo.id = ol.from_odp_id
      JOIN odps to_odp ON to_odp.id = ol.to_odp_id
      WHERE ol.deleted_at IS NULL
      ORDER BY ol.created_at DESC
    `);
    return links.map((l: any) => ({
      id: l.id,
      from_odp_id: l.from_odp_id,
      to_odp_id: l.to_odp_id,
      from_port: l.from_port,
      to_port: l.to_port,
      cable_color: l.cable_color,
      cable_core: l.cable_core,
      status: l.status,
      from_name: l.from_name,
      from_code: l.from_code,
      to_name: l.to_name,
      to_code: l.to_code,
      from_coords: l.from_geom ? JSON.parse(l.from_geom).coordinates : null,
      to_coords: l.to_geom ? JSON.parse(l.to_geom).coordinates : null,
    }));
  }

  async getGeoJSON() {
    const links = await this.getAll();
    const features = links
      .filter(l => l.from_coords && l.to_coords)
      .map(l => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [l.from_coords, l.to_coords],
        },
        properties: {
          id: l.id,
          from_odp_id: l.from_odp_id,
          to_odp_id: l.to_odp_id,
          from_port: l.from_port,
          to_port: l.to_port,
          cable_color: l.cable_color,
          cable_core: l.cable_core,
          from_name: l.from_name,
          to_name: l.to_name,
        },
      }));
    return { type: 'FeatureCollection', features };
  }

  async delete(id: string) {
    await this.prisma.$executeRawUnsafe(
      `UPDATE odp_links SET deleted_at = NOW() WHERE id = $1::uuid`,
      id
    );
    return { success: true };
  }
}
