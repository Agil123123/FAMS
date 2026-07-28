import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ContextBuilderService } from './context/context-builder.service';
import { FiberAnalysisEngine } from './engines/fiber-analysis.engine';
import { CustomerAnalysisEngine } from './engines/customer-analysis.engine';
import { RecommendationEngine } from './engines/recommendation.engine';
import { DatabaseService } from '../database/database.service';
import { PromptManager } from './prompts/prompt-manager';

describe('AI Module', () => {
  let service: AiService;
  let contextBuilder: ContextBuilderService;
  let fiberEngine: FiberAnalysisEngine;
  let recommendationEngine: RecommendationEngine;

  const mockPrisma = {
    customer: {
      findUnique: jest.fn().mockResolvedValue({ id: 'c1', full_name: 'John Doe', status: 'ACTIVE', odp_id: 'odp-1' }),
      count: jest.fn().mockResolvedValue(100),
    },
    customerOnu: {
      findUnique: jest.fn().mockResolvedValue({ id: 'onu-1', customer_id: 'c1', serial_number: 'ONU-001' }),
    },
    odp: {
      findUnique: jest.fn().mockResolvedValue({ id: 'odp-1', name: 'ODP-Central', closure_id: 'cl-1' }),
      findMany: jest.fn().mockResolvedValue([
        { id: 'odp-1', name: 'ODP-Central', customers: Array(14).fill({ id: 'x' }) },
        { id: 'odp-2', name: 'ODP-West', customers: [{ id: 'y' }, { id: 'z' }] },
      ]),
      count: jest.fn().mockResolvedValue(20),
    },
    olt: {
      findFirst: jest.fn().mockResolvedValue({ id: 'olt-1', name: 'OLT-Main' }),
      count: jest.fn().mockResolvedValue(3),
    },
    asset: { count: jest.fn().mockResolvedValue(250) },
    alarm: { count: jest.fn().mockResolvedValue(3) },
    deviceStatus: { count: jest.fn().mockResolvedValue(1) },
    workOrder: {
      count: jest.fn().mockResolvedValue(7),
      findMany: jest.fn().mockResolvedValue([{ id: 'wo-1', title: 'Install' }]),
    },
    $queryRawUnsafe: jest.fn().mockResolvedValue([
      { id: 'odp-1', name: 'ODP-Near', available_ports: 11, distance_meters: 150 },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        ContextBuilderService,
        FiberAnalysisEngine,
        CustomerAnalysisEngine,
        RecommendationEngine,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    contextBuilder = module.get<ContextBuilderService>(ContextBuilderService);
    fiberEngine = module.get<FiberAnalysisEngine>(FiberAnalysisEngine);
    recommendationEngine = module.get<RecommendationEngine>(RecommendationEngine);
  });

  afterEach(() => jest.clearAllMocks());

  describe('PromptManager', () => {
    it('should return all 7 prompt templates', () => {
      expect(PromptManager.getAllPrompts().length).toBe(7);
    });

    it('should build a prompt with context', () => {
      const result = PromptManager.buildPromptWithContext('CHAT', { assets: 100 });
      expect(result).toContain('FAMS AI Assistant');
      expect(result).toContain('100');
    });
  });

  describe('ContextBuilder', () => {
    it('should build fiber context with correct customer name', async () => {
      const ctx = await contextBuilder.buildFiberContext('c1');
      expect(ctx.customer.full_name).toBe('John Doe');
      expect(ctx.onu.serial_number).toBe('ONU-001');
      expect(ctx.topology.length).toBeGreaterThan(0);
    });

    it('should build capacity context with customer counts per ODP', async () => {
      const ctx = await contextBuilder.buildCapacityContext();
      expect(ctx.total_olts).toBe(3);
      expect(ctx.customers_per_odp[0].customer_count).toBe(14);
    });

    it('should build network context', async () => {
      const ctx = await contextBuilder.buildNetworkContext();
      expect(ctx.total_assets).toBe(250);
      expect(ctx.health_score).toBeLessThanOrEqual(100);
    });
  });

  describe('FiberAnalysisEngine', () => {
    it('should analyze a healthy fiber path', async () => {
      const ctx = await contextBuilder.buildFiberContext('c1');
      const result = fiberEngine.analyze(ctx);
      expect(result.customer_name).toBe('John Doe');
      expect(result.health_score).toBe(100);
      expect(result.topology_chain.length).toBeGreaterThan(0);
    });
  });

  describe('AiService', () => {
    it('should handle chat messages about network health', async () => {
      const result = await service.chat('What is the network health?');
      expect(result.type).toBe('network_analysis');
    });

    it('should handle chat messages about capacity', async () => {
      const result = await service.chat('Show me capacity utilization');
      expect(result.type).toBe('capacity_analysis');
    });

    it('should perform fiber trace', async () => {
      const result = await service.fiberTrace('c1');
      expect(result.type).toBe('fiber_trace');
      expect(result.analysis.customer_name).toBe('John Doe');
    });

    it('should perform capacity analysis', async () => {
      const result = await service.capacityAnalysis();
      expect(result.type).toBe('capacity_analysis');
      expect(result.summary.total_olts).toBe(3);
    });

    it('should generate recommendations', async () => {
      const result = await service.recommendation();
      expect(result.type).toBe('recommendation');
      expect(result.total_recommendations).toBeGreaterThan(0);
    });

    it('should find nearest ODP via PostGIS', async () => {
      const result = await service.nearestOdp(-6.2, 106.8);
      expect(result.type).toBe('nearest_odp');
      expect(result.results.length).toBeGreaterThan(0);
    });
  });
});
