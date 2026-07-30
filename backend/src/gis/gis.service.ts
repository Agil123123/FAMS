import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GisService {
  constructor(private prisma: DatabaseService) {}

  // ============================================================
  // CREATE ASSET
  // ============================================================
  private async ensureOdc(): Promise<string> {
    const existing = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM odcs WHERE deleted_at IS NULL LIMIT 1`
    );
    if (existing.length > 0) return existing[0].id;

    const oltId = uuidv4();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO olts (id, asset_code, name, created_at, updated_at)
       VALUES ($1::uuid, 'OLT-AUTO-001', 'Auto-created OLT', NOW(), NOW())`,
      oltId
    );
    const ppId = uuidv4();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO pon_ports (id, olt_id, port_index, created_at, updated_at)
       VALUES ($1::uuid, $2::uuid, 1, NOW(), NOW())`,
      ppId, oltId
    );
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
      case 'pole':
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO poles (id, asset_code, name, geom, created_by, created_at, updated_at)
           VALUES ($1::uuid, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6::uuid, NOW(), NOW())`,
          uuidv4(), assetCode, name, longitude, latitude, userId
        );
        break;
      case 'odp': {
        const odcId = await this.ensureOdc();
        const closureId = uuidv4();
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO closures (id, asset_code, name, odc_id, created_at, updated_at)
           VALUES ($1::uuid, $2, $3, $4::uuid, NOW(), NOW())`,
          closureId, `CLOSURE-${assetCode}`, `Closure for ${name}`, odcId
        );
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
      case 'homepass':
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO homepasses (id, name, address, geom, created_by, created_at, updated_at)
           VALUES ($1::uuid, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6::uuid, NOW(), NOW())`,
          uuidv4(), name, extra.address || '', longitude, latitude, userId
        );
        break;
      default:
        throw new Error(`Unknown type: ${type}`);
    }
    return { success: true, asset_code: assetCode };
  }

  // ============================================================
  // GET ASSETS / CUSTOMERS
  // ============================================================
  async getAssets() {
    const features: any[] = [];
    const tables = ['olts', 'odcs', 'odps', 'closures', 'poles'];
    const types = ['OLT', 'ODC', 'ODP', 'Closure', 'Pole'];
    for (let i = 0; i < tables.length; i++) {
      const rows = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, name, asset_code, ST_AsGeoJSON(geom) as geometry
         FROM ${tables[i]} WHERE deleted_at IS NULL AND geom IS NOT NULL`
      );
      this.pushFeatures(features, rows, types[i]);
    }
    return { type: 'FeatureCollection', features };
  }

  async getCustomers() {
    const features: any[] = [];
    const customers = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT c.id, c.full_name as name, c.customer_code as asset_code,
              ST_AsGeoJSON(o.geom) as geometry
       FROM customers c JOIN odps o ON c.odp_id = o.id
       WHERE c.deleted_at IS NULL AND o.geom IS NOT NULL`
    );
    this.pushFeatures(features, customers, 'Customer');
    return { type: 'FeatureCollection', features };
  }

  private pushFeatures(featuresArray: any[], records: any[], type: string) {
    for (const record of records) {
      if (record.geometry) {
        featuresArray.push({
          type: 'Feature',
          geometry: JSON.parse(record.geometry),
          properties: { id: record.id, name: record.name, asset_code: record.asset_code, type },
        });
      }
    }
  }

  // ============================================================
  // ODP LIST + PORTS
  // ============================================================
  async getOdpsList() {
    const odps = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT o.id, o.name, o.asset_code, ST_AsGeoJSON(o.geom) as geometry,
              COALESCE((SELECT COUNT(*) FROM customers c WHERE c.odp_id = o.id AND c.deleted_at IS NULL), 0) as used_ports
       FROM odps o WHERE o.deleted_at IS NULL ORDER BY o.name ASC`
    );
    return odps.map((o: any) => {
      const capacity = 8;
      const used = parseInt(o.used_ports) || 0;
      return {
        id: o.id, name: o.name, asset_code: o.asset_code,
        capacity, used_ports: used, free_ports: capacity - used,
        coordinates: o.geometry ? JSON.parse(o.geometry).coordinates : null,
      };
    });
  }

  async getOdpPorts(id: string) {
    const odp = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT o.id, o.name, o.asset_code,
        (SELECT COUNT(*) FROM customers c WHERE c.odp_id = o.id AND c.deleted_at IS NULL) as used
       FROM odps o WHERE o.id = $1::uuid AND o.deleted_at IS NULL`, id
    );
    if (odp.length === 0) return { error: 'ODP not found' };
    const o = odp[0];
    const capacity = 8;
    const used = parseInt(o.used) || 0;
    return {
      id: o.id, name: o.name, asset_code: o.asset_code, capacity,
      used_ports: used, free_ports: capacity - used,
      ports: Array.from({ length: capacity }, (_, i) => ({
        number: i + 1, status: i < used ? 'used' : 'free',
      })),
    };
  }

  // ============================================================
  // ODP DETAIL — FULL FIBER INVENTORY
  // ============================================================
  async getOdpDetail(id: string) {
    const odp = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT o.id, o.name, o.asset_code, o.closure_id, o.created_at,
              ST_AsGeoJSON(o.geom) as geometry
       FROM odps o WHERE o.id = $1::uuid AND o.deleted_at IS NULL`, id
    );
    if (odp.length === 0) throw new NotFoundException('ODP not found');
    const o = odp[0];

    // 1. Upstream path: ODP → Closure → ODC → PonPort → OLT
    const upstream = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT c.id as closure_id, c.name as closure_name, c.asset_code as closure_code,
              odc.id as odc_id, odc.name as odc_name, odc.asset_code as odc_code,
              pp.id as pon_port_id, pp.port_index,
              olt.id as olt_id, olt.name as olt_name, olt.asset_code as olt_code,
              ST_AsGeoJSON(olt.geom) as olt_geom
       FROM odps o
       JOIN closures c ON o.closure_id = c.id
       JOIN odcs odc ON c.odc_id = odc.id
       JOIN pon_ports pp ON odc.pon_port_id = pp.id
       JOIN olts olt ON pp.olt_id = olt.id
       WHERE o.id = $1::uuid AND c.deleted_at IS NULL AND odc.deleted_at IS NULL`, id
    );

    // 2. Splice records within this ODP
    const splices = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, tray_number, source_type, source_label, source_core,
              target_type, target_label, target_core, splice_type, attenuation, notes
       FROM odp_splice_records WHERE odp_id = $1::uuid AND deleted_at IS NULL
       ORDER BY tray_number, source_core`, id
    );

    // 3. Splitters installed in this ODP
    const splitters = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT s.id, s.asset_code, st.name as type_name, st.ratio_in, st.ratio_out
       FROM splitters s
       JOIN splitter_types st ON s.splitter_type_id = st.id
       WHERE s.odp_id = $1::uuid AND s.deleted_at IS NULL`, id
    );

    // 4. Incoming links (from other ODP to this ODP)
    const incoming = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT ol.id, ol.from_port, ol.to_port, ol.cable_color, ol.cable_core,
              fo.name as from_name, fo.asset_code as from_code, fo.id as from_id
       FROM odp_links ol
       JOIN odps fo ON fo.id = ol.from_odp_id
       WHERE ol.to_odp_id = $1::uuid AND ol.deleted_at IS NULL`, id
    );

    // 5. Outgoing links (from this ODP to other ODP)
    const outgoing = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT ol.id, ol.from_port, ol.to_port, ol.cable_color, ol.cable_core,
              to_odp.name as to_name, to_odp.asset_code as to_code, to_odp.id as to_id
       FROM odp_links ol
       JOIN odps to_odp ON to_odp.id = ol.to_odp_id
       WHERE ol.from_odp_id = $1::uuid AND ol.deleted_at IS NULL`, id
    );

    // 6. Customers connected
    const customers = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, full_name, customer_code, status
       FROM customers WHERE odp_id = $1::uuid AND deleted_at IS NULL`, id
    );

    return {
      id: o.id,
      name: o.name,
      asset_code: o.asset_code,
      coordinates: o.geometry ? JSON.parse(o.geometry).coordinates : null,
      created_at: o.created_at,
      upstream: upstream.length > 0 ? {
        closure: { id: upstream[0].closure_id, name: upstream[0].closure_name, code: upstream[0].closure_code },
        odc: { id: upstream[0].odc_id, name: upstream[0].odc_name, code: upstream[0].odc_code },
        pon_port: { id: upstream[0].pon_port_id, index: upstream[0].port_index },
        olt: { id: upstream[0].olt_id, name: upstream[0].olt_name, code: upstream[0].olt_code, coords: upstream[0].olt_geom ? JSON.parse(upstream[0].olt_geom).coordinates : null },
      } : null,
      splices,
      splitters,
      incoming_links: incoming,
      outgoing_links: outgoing,
      customers,
    };
  }

  // ============================================================
  // SPLICE RECORDS
  // ============================================================
  async createSpliceRecord(odpId: string, body: any, userId: string) {
    const { tray_number, source_type, source_label, source_core,
            target_type, target_label, target_core, splice_type, attenuation, notes } = body;
    const id = uuidv4();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO odp_splice_records (id, odp_id, tray_number, source_type, source_label, source_core,
        target_type, target_label, target_core, splice_type, attenuation, notes, created_by, created_at, updated_at)
       VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::uuid, NOW(), NOW())`,
      id, odpId, tray_number || 1, source_type, source_label, source_core || null,
      target_type, target_label, target_core || null, splice_type || 'fusion', attenuation || null, notes || null, userId
    );
    return { success: true, id };
  }

  async deleteSpliceRecord(id: string) {
    await this.prisma.$executeRawUnsafe(
      `UPDATE odp_splice_records SET deleted_at = NOW() WHERE id = $1::uuid`, id
    );
    return { success: true };
  }

  // ============================================================
  // SPLITTER TYPES
  // ============================================================
  async getSplitterTypes() {
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, name, ratio_in, ratio_out FROM splitter_types WHERE deleted_at IS NULL ORDER BY name`
    );
  }

  // ============================================================
  // SPLITTER MANAGEMENT
  // ============================================================
  async addSplitter(odpId: string, body: any, userId: string) {
    const { splitter_type_id } = body;
    const assetCode = `SPL-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    const id = uuidv4();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO splitters (id, asset_code, odp_id, splitter_type_id, created_by, created_at, updated_at)
       VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5::uuid, NOW(), NOW())`,
      id, assetCode, odpId, splitter_type_id, userId
    );
    return { success: true, id, asset_code: assetCode };
  }
}
