import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GisService {
  constructor(private prisma: DatabaseService) {}

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
      SELECT id, full_name as name, customer_code as asset_code, ST_AsGeoJSON(geom) as geometry 
      FROM customers WHERE deleted_at IS NULL AND geom IS NOT NULL
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
