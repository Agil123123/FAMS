import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GisService {
  constructor(private prisma: DatabaseService) {}

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
        // Auto-find or create a closure for this ODP
        const closure = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT id FROM closures WHERE deleted_at IS NULL LIMIT 1`
        );
        let closureId: string;
        if (closure.length === 0) {
          // Auto-create an ODC first, then closure
          const odcId = uuidv4();
          await this.prisma.$executeRawUnsafe(
            `INSERT INTO odcs (id, asset_code, name, pon_port_id, created_at, updated_at)
             VALUES ($1::uuid, 'ODC-AUTO', 'Auto-created ODC', 
             (SELECT id FROM pon_ports WHERE deleted_at IS NULL LIMIT 1), NOW(), NOW())`,
            odcId
          );
          closureId = uuidv4();
          await this.prisma.$executeRawUnsafe(
            `INSERT INTO closures (id, asset_code, name, odc_id, created_at, updated_at)
             VALUES ($1::uuid, 'CLOSURE-AUTO', 'Auto-created Closure', $2::uuid, NOW(), NOW())`,
            closureId, odcId
          );
        } else {
          closureId = closure[0].id;
        }
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
        // Auto-find or create an ODC
        let odc = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT id FROM odcs WHERE deleted_at IS NULL LIMIT 1`
        );
        let odcId: string;
        if (odc.length === 0) {
          odcId = uuidv4();
          await this.prisma.$executeRawUnsafe(
            `INSERT INTO odcs (id, asset_code, name, pon_port_id, created_at, updated_at)
             VALUES ($1::uuid, 'ODC-AUTO', 'Auto-created ODC', 
             (SELECT id FROM pon_ports WHERE deleted_at IS NULL LIMIT 1), NOW(), NOW())`,
            odcId
          );
        } else {
          odcId = odc[0].id;
        }
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
    
    // Fetch OLTs
    const olts = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, asset_code, ST_AsGeoJSON(geom) as geometry 
      FROM olts WHERE deleted_at IS NULL AND geom IS NOT NULL
    `);
    this.pushFeatures(features, olts, 'OLT');

    // Fetch ODCs
    const odcs = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, asset_code, ST_AsGeoJSON(geom) as geometry 
      FROM odcs WHERE deleted_at IS NULL AND geom IS NOT NULL
    `);
    this.pushFeatures(features, odcs, 'ODC');

    // Fetch ODPs
    const odps = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, asset_code, ST_AsGeoJSON(geom) as geometry 
      FROM odps WHERE deleted_at IS NULL AND geom IS NOT NULL
    `);
    this.pushFeatures(features, odps, 'ODP');

    // Fetch Closures
    const closures = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, asset_code, ST_AsGeoJSON(geom) as geometry 
      FROM closures WHERE deleted_at IS NULL AND geom IS NOT NULL
    `);
    this.pushFeatures(features, closures, 'Closure');

    // Fetch Poles
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
}
