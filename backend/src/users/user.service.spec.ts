import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { messages } from '../utils/messages/messages';

const mockUserRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByEmail: jest.fn().mockResolvedValue(null), 
  createUser: jest.fn(),
  findAllUsers: jest.fn(),
  updateUser: jest.fn(),
  softDeleteUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const userDto = {
      name: 'Mohd Adil',
      email: 'adil@binmile.com',
      password: '123456',
      address: 'Azamgarh',
    };

    const user = { ...userDto, id: 1 };

    mockUserRepository.findByEmail.mockResolvedValue(null); 
    mockUserRepository.createUser.mockResolvedValue(user);

    expect(await service.create(userDto)).toEqual({
      success: true,
      message:messages.USER_CREATED, 
      user,
    });
  });
});
