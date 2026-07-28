import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUsersRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
    };

    it('should throw ConflictException if email exists', async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce({ id: '1' });
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should create user if inputs are valid', async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(null);
      mockUsersRepository.findByUsername.mockResolvedValueOnce(null);
      (argon2.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
      
      mockUsersRepository.create.mockResolvedValueOnce({ id: '1', ...createDto, password: 'hashedPassword' });

      const result = await service.create(createDto);
      expect(result.id).toBe('1');
      expect(mockUsersRepository.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findById.mockResolvedValueOnce(null);
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });

    it('should return user if found', async () => {
      mockUsersRepository.findById.mockResolvedValueOnce({ id: '1' });
      const result = await service.findById('1');
      expect(result.id).toBe('1');
    });
  });
});
