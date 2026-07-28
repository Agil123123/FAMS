import { Test, TestingModule } from '@nestjs/testing';
import { FiberTraceService } from './fiber-trace.service';
import { DatabaseService } from '../database/database.service';

describe('FiberTraceService', () => {
  let service: FiberTraceService;
  let prisma: DatabaseService;

  const mockCustomer = {
    id: 'cust-1',
    full_name: 'Customer 1',
    odp: {
      id: 'odp-1',
      name: 'ODP 1',
      closure: {
        id: 'closure-1',
        name: 'Closure 1',
        odc: {
          id: 'odc-1',
          name: 'ODC 1',
          pon_port: {
            olt: {
              id: 'olt-1',
              name: 'OLT 1'
            }
          }
        }
      }
    }
  };

  const mockPrisma = {
    customer: {
      findUnique: jest.fn().mockResolvedValue(mockCustomer)
    },
    $queryRawUnsafe: jest.fn().mockResolvedValue([{ geometry: '{"type":"Point","coordinates":[106,-6]}' }])
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiberTraceService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FiberTraceService>(FiberTraceService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a full trace from customer', async () => {
    const result = await service.traceFromCustomer('cust-1');
    expect(result.nodes.length).toBe(5); // Customer, ODP, Closure, ODC, OLT
    expect(result.edges.length).toBe(4);
    
    // Check nodes contain geometry
    expect(result.nodes[0].geometry).toEqual({ type: 'Point', coordinates: [106, -6] });
  });
});
