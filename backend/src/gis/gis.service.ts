import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GisService {
  constructor(private prisma: DatabaseService) {}

  /** Ensure OLT → PonPort → ODC exist, return odc_id */
  private async ensureOdc(): Promise<string> {
    const existing = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM odcs WHERE deleted_at IS NULL LIMIT 1`
    );
    if (existing.length > 0) return existing[0].id;

    // Create OLT
    const oltId = uuidv4();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO olts (id, asset_code, name, created_at, updated_at)
       VALUES ($1::uuid, 'OLT-AUTO-001', 'Auto-created OLT', NOW(), NOW())`,
      oltId
    );

    // Create PonPort
    const ppId = uuidv4();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO pon_ports (id, olt_id, port_index, created_at, updated_at)
       VALUES ($1::uuid, $2::uuid, 1, NOW(), NOW())`,
      ppId, oltId
    );

    // Create ODC
    const odcId = uuidv4();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO odcs (id, asset_code, name, pon_port_id, created_at, updated_at)
       VALUES ($1::uuid, 'ODC-AUTO-001', 'Auto-created ODC', $2::uuid, NOW(), NOW())`,
      odcId, ppId
    );

    return odcId;
  }

  async create(body: any, userId: string) {
    const { type, name, longitude, latitude, ...extra } = body;
    const assetCode = `${type.toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

    switch (type) {
      case 'pole': {
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO poles (id, asset_code, name, geom, created_by, created_at, updated_at)
           VALUES ($1::uuid, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6::uuid, NOW(), NOW())`,
          uuidv4(), assetCode, name, longitude, latitude, userId
        );
        break;
      }
      case 'odp': {
        const odcId = await this.ensureOdc();
        // Create closure for this ODP
        const closureId = uuidv4();
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO closures (id, asset_code, name, odc_id, created_at, updated_at)
           VALUES ($1::uuid, $2, $3, $4::uuid, NOW(), NOW())`,
          closureId, `CLOSURE-${assetCode}`, `Closure for ${name}`, odcId
        );
        const capacity = extra.capacity || 8;
        const odpCode = extra.odp_code || assetCode;
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO odps (id, asset_code, name, closure_id, geom, created_by, created_at, updated_at)
           VALUES ($1::uuid, $2, $3, $4::uuid, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7::uuid, NOW(), NOW())`,
          uuidv4(), odpCode, name, closureId, longitude, latitude, userId
        );
        break;
      }
      case 'closure': {
        const odcId = await this.ensureOdc();
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO closures (id, asset_code, name, odc_id, geom, created_by, created_at, updated_at)
           VALUES ($1::uuid, $2, $3, $4::uuid, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7::uuid, NOW(), NOW())`,
          uuidv4(), assetCode, name, odcId, longitude, latitude, userId
        );
        break;
      }
      case 'homepass': {
        const address = extra.address || 'Auto-created';
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO homepasses (id, name, address, geom, created_by, created_at, updated_at)
           VALUES ($1::uuid, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6::uuid, NOW(), NOW())`,
          uuidv4(), name, address, longitude, latitude, userId
        );
        break;
      }
      default:
        throw new Error(`Unknown type: ${type}`);
    }

    return { success: true, asset_code: assetCode };
  }

  async getAssets() {
    const features: any[] = [];
    
    const olts = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, asset_code, ST_AsGeoJSON(geom) as geometry 
      FROM olts WHERE deleted_at IS NULL AND geom IS NOT NULL
    `);
    this.pushFeatures(features, olts, 'OLT');

    const odcs = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, asset_code, ST_AsGeoJSON(geom) as geometry 
      FROM odcs WHERE deleted_at IS NULL AND geom IS NOT NULL
    `);
    this.pushFeatures(features, odcs, 'ODC');

    const odps = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, asset_code, ST_AsGeoJSON(geom) as geometry 
      FROM odps WHERE deleted_at IS NULL AND geom IS NOT NULL
    `);
    this.pushFeatures(features, odps, 'ODP');

    const closures = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, asset_code, ST_AsGeoJSON(geom) as geometry 
      FROM closures WHERE deleted_at IS NULL AND geom IS NOT NULL
    `);
    this.pushFeatures(features, closures, 'Closure');

    const poles = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, asset_code, ST_AsGeoJSON(geom) as geometry 
      FROM poles WHERE deleted_at IS NULL AND geom IS NOT NULL
    `);
    this.pushFeatures(features, poles, 'Pole');

    return {
      type: 'FeatureCollection',
      features
    };
  }

  async getCustomers() {
    const features: any[] = [];
    
    const customers = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT c.id, c.full_name as name, c.customer_code as asset_code,
             ST_AsGeoJSON(o.geom) as geometry
      FROM customers c
      JOIN odps o ON c.odp_id = o.id
      WHERE c.deleted_at IS NULL AND o.geom IS NOT NULL
    `);
    this.pushFeatures(features, customers, 'Customer');

    return {
      type: 'FeatureCollection',
      features
    };
  }

  private pushFeatures(featuresArray: any[], records: any[], type: string) {
    for (const record of records) {
      if (record.geometry) {
        featuresArray.push({
          type: 'Feature',
          geometry: JSON.parse(record.geometry),
          properties: {
            id: record.id,
            name: record.name,
            asset_code: record.asset_code,
            type: type
          }
        });
      }
    }
  }

  async getOdpsList() {
    const odps = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT o.id, o.name, o.asset_code, ST_AsGeoJSON(o.geom) as geometry,
             COALESCE((SELECT COUNT(*) FROM customers c WHERE c.odp_id = o.id AND c.deleted_at IS NULL), 0) as used_ports
      FROM odps o
      WHERE o.deleted_at IS NULL
      ORDER BY o.name ASC
    `);
    return odps.map((o: any) => {
      const capacity = 8;
      const used = parseInt(o.used_ports) || 0;
      return {
        id: o.id,
        name: o.name,
        asset_code: o.asset_code,
        capacity,
        used_ports: used,
        free_ports: capacity - used,
        coordinates: o.geometry ? JSON.parse(o.geometry).coordinates : null,
      };
    });
  }

  async getOdpPorts(id: string) {
    // Get ODP capacity + count connected children
    const odp = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT o.id, o.name, o.asset_code,
             (SELECT COUNT(*) FROM customers c WHERE c.odp_id = o.id AND c.deleted_at IS NULL) as used_ports
      FROM odps o WHERE o.id = $1::uuid AND o.deleted_at IS NULL
    `, id);

    if (odp.length === 0) return { error: 'ODP not found' };

    const o = odp[0];
    const capacity = 8; // default, can be extended
    const used = parseInt(o.used_ports) || 0;
    const free = capacity - used;

    return {
      id: o.id,
      name: o.name,
      asset_code: o.asset_code,
      capacity,
      used_ports: used,
      free_ports: free,
      ports: Array.from({ length: capacity }, (_, i) => ({
        number: i + 1,
        status: i < used ? 'used' : 'free',
      })),
    };
  }
}
