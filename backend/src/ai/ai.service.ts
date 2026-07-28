import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ContextBuilderService } from './context/context-builder.service';
import { FiberAnalysisEngine } from './engines/fiber-analysis.engine';
import { CustomerAnalysisEngine } from './engines/customer-analysis.engine';
import { RecommendationEngine } from './engines/recommendation.engine';
import { PromptManager } from './prompts/prompt-manager';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: DatabaseService,
    private contextBuilder: ContextBuilderService,
    private fiberEngine: FiberAnalysisEngine,
    private customerEngine: CustomerAnalysisEngine,
    private recommendationEngine: RecommendationEngine,
  ) {}

  async chat(message: string) {
    this.logger.log(`AI Chat request: "${message}"`);
    const prompt = PromptManager.getPrompt('CHAT');

    // Intent detection — simple keyword matching for the prototype
    const lower = message.toLowerCase();

    if (lower.includes('capacity') || lower.includes('utilization')) {
      return this.capacityAnalysis();
    }
    if (lower.includes('recommend') || lower.includes('suggestion')) {
      return this.recommendation();
    }
    if (lower.includes('health') || lower.includes('network') || lower.includes('status')) {
      return this.networkAnalysis();
    }

    // Default: return a contextual summary
    const networkCtx = await this.contextBuilder.buildNetworkContext();
    return {
      type: 'chat_response',
      prompt_used: prompt.type,
      message: `FAMS Network Summary: ${networkCtx.total_assets} assets registered, ${networkCtx.active_alarms} active alarms, ${networkCtx.offline_devices} offline devices, ${networkCtx.pending_work_orders} pending work orders. System health: ${networkCtx.health_score}%.`,
      context: networkCtx,
    };
  }

  async fiberTrace(customerId: string) {
    this.logger.log(`AI Fiber Trace for customer: ${customerId}`);
    const context = await this.contextBuilder.buildFiberContext(customerId);
    const analysis = this.fiberEngine.analyze(context);

    return {
      type: 'fiber_trace',
      prompt_used: PromptManager.getPrompt('FIBER_TRACE').type,
      analysis,
    };
  }

  async nearestOdp(lat: number, lng: number) {
    this.logger.log(`AI Nearest ODP for coordinates: ${lat}, ${lng}`);

    // Use raw PostGIS query for true spatial distance calculation
    const results = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id, name, port_total, port_used,
        (port_total - port_used) AS available_ports,
        ST_Distance(
          geom::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) AS distance_meters
      FROM odps
      WHERE deleted_at IS NULL
        AND geom IS NOT NULL
        AND (port_total - port_used) > 0
      ORDER BY distance_meters ASC
      LIMIT 5
    `, lng, lat);

    return {
      type: 'nearest_odp',
      prompt_used: PromptManager.getPrompt('NEAREST_ODP').type,
      coordinates: { lat, lng },
      results: results.map((r: any) => ({
        ...r,
        distance_meters: Math.round(r.distance_meters),
      })),
    };
  }

  async capacityAnalysis() {
    this.logger.log('AI Capacity Analysis');
    const context = await this.contextBuilder.buildCapacityContext();

    const overloaded = context.customers_per_odp.filter((o) => o.customer_count >= 12);

    return {
      type: 'capacity_analysis',
      prompt_used: PromptManager.getPrompt('CAPACITY').type,
      summary: {
        total_olts: context.total_olts,
        total_odps: context.total_odps,
        total_customers: context.total_customers,
        saturated_odps: overloaded.length,
      },
      high_density_odps: overloaded,
      message: overloaded.length > 0
        ? `Warning: ${overloaded.length} ODP(s) have 12 or more customers connected.`
        : 'All ODPs are within normal capacity thresholds.',
    };
  }

  async networkAnalysis() {
    this.logger.log('AI Network Analysis');
    const context = await this.contextBuilder.buildNetworkContext();

    const attentionAreas: string[] = [];
    if (context.active_alarms > 0) attentionAreas.push(`${context.active_alarms} unresolved alarms`);
    if (context.offline_devices > 0) attentionAreas.push(`${context.offline_devices} offline devices`);
    if (context.pending_work_orders > 5) attentionAreas.push(`${context.pending_work_orders} pending work orders`);

    return {
      type: 'network_analysis',
      prompt_used: PromptManager.getPrompt('NETWORK').type,
      health_score: context.health_score,
      metrics: context,
      attention_areas: attentionAreas.length > 0 ? attentionAreas : ['No critical areas. Network is healthy.'],
    };
  }

  async recommendation() {
    this.logger.log('AI Recommendation');
    const capacity = await this.contextBuilder.buildCapacityContext();
    const network = await this.contextBuilder.buildNetworkContext();
    const result = this.recommendationEngine.generate(capacity, network);

    return {
      type: 'recommendation',
      prompt_used: PromptManager.getPrompt('RECOMMENDATION').type,
      ...result,
    };
  }
}
