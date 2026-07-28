import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface TraceNode {
  id: string;
  type: string;
  name: string;
  geometry: any;
}

export interface TraceEdge {
  source: string;
  target: string;
  type: string;
}

export interface TraceResult {
  nodes: TraceNode[];
  edges: TraceEdge[];
}

@Injectable()
export class FiberTraceService {
  constructor(private prisma: DatabaseService) {}

  // In a full production scenario, this uses complex PostGIS recursive CTEs.
  // We will simulate a topological fetch using Prisma queries bridging relationships,
  // supplemented with raw PostGIS queries to pull GeoJSON geometries.
  async traceFromCustomer(customerId: string): Promise<TraceResult> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { odp: { include: { closure: { include: { odc: { include: { pon_port: { include: { olt: true } } } } } } } } }
    });

    if (!customer) throw new NotFoundException('Customer not found');

    const result: TraceResult = { nodes: [], edges: [] };
    
    // Node: Customer
    const custGeom = await this.getGeoJSON('customers', customer.id);
    result.nodes.push({ id: customer.id, type: 'Customer', name: customer.full_name, geometry: custGeom });

    if (customer.odp) {
      const odp = customer.odp;
      const odpGeom = await this.getGeoJSON('odps', odp.id);
      result.nodes.push({ id: odp.id, type: 'ODP', name: odp.name, geometry: odpGeom });
      result.edges.push({ source: customer.id, target: odp.id, type: 'Drop Cable' });

      if (odp.closure) {
        const closure = odp.closure;
        const closureGeom = await this.getGeoJSON('closures', closure.id);
        result.nodes.push({ id: closure.id, type: 'Closure', name: closure.name, geometry: closureGeom });
        result.edges.push({ source: odp.id, target: closure.id, type: 'Distribution Cable' });

        if (closure.odc) {
          const odc = closure.odc;
          const odcGeom = await this.getGeoJSON('odcs', odc.id);
          result.nodes.push({ id: odc.id, type: 'ODC', name: odc.name, geometry: odcGeom });
          result.edges.push({ source: closure.id, target: odc.id, type: 'Feeder Cable' });

          if (odc.pon_port && odc.pon_port.olt) {
            const olt = odc.pon_port.olt;
            const oltGeom = await this.getGeoJSON('olts', olt.id);
            result.nodes.push({ id: olt.id, type: 'OLT', name: olt.name, geometry: oltGeom });
            result.edges.push({ source: odc.id, target: olt.id, type: 'Trunk Cable' });
          }
        }
      }
    }

    return result;
  }

  async traceFromOdp(odpId: string): Promise<TraceResult> {
    const odp = await this.prisma.odp.findUnique({
      where: { id: odpId },
      include: { 
        closure: { include: { odc: { include: { pon_port: { include: { olt: true } } } } } },
        customers: true
      }
    });

    if (!odp) throw new NotFoundException('ODP not found');

    const result: TraceResult = { nodes: [], edges: [] };
    
    const odpGeom = await this.getGeoJSON('odps', odp.id);
    result.nodes.push({ id: odp.id, type: 'ODP', name: odp.name, geometry: odpGeom });

    for (const cust of odp.customers) {
      const custGeom = await this.getGeoJSON('customers', cust.id);
      result.nodes.push({ id: cust.id, type: 'Customer', name: cust.full_name, geometry: custGeom });
      result.edges.push({ source: odp.id, target: cust.id, type: 'Drop Cable' });
    }

    // Traverse up
    if (odp.closure) {
      const closure = odp.closure;
      const closureGeom = await this.getGeoJSON('closures', closure.id);
      result.nodes.push({ id: closure.id, type: 'Closure', name: closure.name, geometry: closureGeom });
      result.edges.push({ source: odp.id, target: closure.id, type: 'Distribution Cable' });

      if (closure.odc) {
        const odc = closure.odc;
        const odcGeom = await this.getGeoJSON('odcs', odc.id);
        result.nodes.push({ id: odc.id, type: 'ODC', name: odc.name, geometry: odcGeom });
        result.edges.push({ source: closure.id, target: odc.id, type: 'Feeder Cable' });
      }
    }
    return result;
  }

  async traceFromCore(coreId: string): Promise<TraceResult> {
    // Simulated core trace
    const core = await this.prisma.fiberCore.findUnique({
      where: { id: coreId },
      include: { fiber_cable: true }
    });
    if (!core) throw new NotFoundException('Core not found');

    const result: TraceResult = { nodes: [], edges: [] };
    result.nodes.push({ id: core.id, type: 'FiberCore', name: `Core ${core.core_index}`, geometry: null });
    if (core.fiber_cable) {
      result.nodes.push({ id: core.fiber_cable.id, type: 'FiberCable', name: core.fiber_cable.asset_code, geometry: null });
      result.edges.push({ source: core.id, target: core.fiber_cable.id, type: 'Contained In' });
    }
    return result;
  }

  // Helper method using raw SQL to extract GeoJSON from the Unsupported PostGIS type
  private async getGeoJSON(table: string, id: string): Promise<any> {
    try {
      const result = await this.prisma.$queryRawUnsafe(`
        SELECT ST_AsGeoJSON(geom) as geometry 
        FROM "${table}" 
        WHERE id = $1::uuid
      `, id);
      
      if (Array.isArray(result) && result.length > 0 && result[0].geometry) {
        return JSON.parse(result[0].geometry);
      }
    } catch (e) {
      // In tests, PostGIS might not be available
      console.warn(`GeoJSON extraction failed for ${table}: ${id}`, e);
    }
    return null;
  }
}
