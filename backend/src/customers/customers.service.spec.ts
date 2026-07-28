import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { DatabaseService } from '../database/database.service';
import { BadRequestException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: DatabaseService;

  const mockCustomer = {
    id: '1',
    customer_code: 'CUST-001',
    status: 'DRAFT',
    customer_onu: null,
    customer_package: null
  };

  const mockPrisma = {
    customer: {
      findUnique: jest.fn().mockResolvedValue(mockCustomer),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue({ ...mockCustomer, status: 'ACTIVE' }),
    },
    customerOnu: {
      create: jest.fn(),
      update: jest.fn()
    },
    customerPackage: {
      create: jest.fn(),
      update: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should prevent activation without ONU', async () => {
    await expect(service.activate('1', 'user1')).rejects.toThrow(BadRequestException);
    await expect(service.activate('1', 'user1')).rejects.toThrow('Cannot activate customer without an assigned ONU');
  });

  it('should prevent activation without Package', async () => {
    mockPrisma.customer.findUnique.mockResolvedValue({
      ...mockCustomer,
      customer_onu: { id: 'onu-1' }
    } as any);

    await expect(service.activate('1', 'user1')).rejects.toThrow(BadRequestException);
    await expect(service.activate('1', 'user1')).rejects.toThrow('Cannot activate customer without an assigned Billing Package');
    
    // reset for next tests
    mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
  });

  it('should activate customer if ONU and Package exist', async () => {
    mockPrisma.customer.findUnique.mockResolvedValueOnce({
      ...mockCustomer,
      customer_onu: { id: 'onu-1' },
      customer_package: { id: 'pkg-1' }
    } as any);

    const result = await service.activate('1', 'user1');
    expect(result.status).toBe('ACTIVE');
    expect(prisma.customer.update).toHaveBeenCalled();
  });
});
