import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { messages } from '../utils/messages/messages';
import { UpdateDto } from './dto/update.dto';

const mockUserRepository = {
  findAllUsers: jest.fn(),
  findById: jest.fn(),
  updateUser: jest.fn(),
  softDeleteUser: jest.fn(),
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
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all users', async () => {
    const users = [
      { id: 1, email: 'adil@binmile.com', password: '123456' },
      { id: 2, email: 'faheem@binmile.com', password: '123456' },
    ];

    mockUserRepository.findAllUsers.mockResolvedValue(users);

    expect(await service.findAll()).toEqual({
      status: 200,
      success: true,
      message: messages.USER_FETCHED,
      users: [
        { id: 1, email: 'adil@binmile.com' },
        { id: 2, email: 'faheem@binmile.com' },
      ],
    });
  });

  it('should find a user by ID', async () => {
    const user = {
      id: 1,
    };

    mockUserRepository.findById.mockResolvedValue(user);

    expect(await service.findOne(1, 1)).toEqual({
      status: 200,
      success: true,
      message: messages.USER_FETCHED,
      user: { id: 1 },
    });
  });

  it('should return USER_NOT_FOUND when user is not found by ID', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    expect(await service.findOne(1, 1)).toEqual({
      status: 404,
      success: false,
      message: messages.USER_NOT_FOUND,
    });
  });

  it('should return ACCESS_NOT_ALLOWED if user access is unauthorized', async () => {
    const user = {
      id: 2, // Different user ID
    };

    mockUserRepository.findById.mockResolvedValue(user);

    expect(await service.findOne(1, 1)).toEqual({
      status: 401,
      success: false,
      message: messages.ACCESS_NOT_ALLOWED,
    });
  });

  it('should update a user', async () => {
    const updateDto: UpdateDto = {
      name: 'Mohd Adil',
      address: 'Noida',
    };
    const user = {
      id: 1,
    };

    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.updateUser.mockResolvedValue(undefined);
    mockUserRepository.findById.mockResolvedValue({ ...user, ...updateDto });

    expect(await service.update(1, updateDto, 1)).toEqual({
      status: 200,
      success: true,
      message: messages.USER_UPDATED,
      user: { id: 1, name: 'Mohd Adil', address: 'Noida' },
    });
  });

  it('should return USER_NOT_FOUND when user is not found for update', async () => {
    const updateDto: UpdateDto = {
      name: 'Mohd Adil',
      address: 'Noida',
    };

    mockUserRepository.findById.mockResolvedValue(null);

    expect(await service.update(1, updateDto, 1)).toEqual({
      status: 404,
      success: false,
      message: messages.USER_NOT_FOUND,
    });
  });

  it('should return UPDATE_NOT_ALLOWED if user access is unauthorized for update', async () => {
    const updateDto: UpdateDto = {
      name: 'Mohd Adil',
      address: 'Noida',
    };
    const user = {
      id: 2, // Different user ID
    };

    mockUserRepository.findById.mockResolvedValue(user);

    expect(await service.update(1, updateDto, 1)).toEqual({
      status: 401,
      success: false,
      message: messages.UPDATE_NOT_ALLOWED,
    });
  });

  it('should delete a user', async () => {
    const user = { id: 1, email: 'faheem@binmile.com' };

    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.softDeleteUser.mockResolvedValue(undefined);

    expect(await service.delete(1, 1)).toEqual({
      status: 200,
      success: true,
      message: messages.USER_DELETED,
    });
  });

  it('should return USER_NOT_FOUND when user is not found for delete', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    expect(await service.delete(1, 1)).toEqual({
      status: 404,
      success: false,
      message: messages.USER_NOT_FOUND,
    });
  });

  it('should return DELETE_NOT_ALLOWED if user access is unauthorized for delete', async () => {
    const user = { id: 2, email: 'faheem@binmile.com' };

    mockUserRepository.findById.mockResolvedValue(user);

    expect(await service.delete(1, 1)).toEqual({
      status: 401,
      success: false,
      message: messages.DELETE_NOT_ALLOWED,
    });
  });

  it('should handle errors during user operations', async () => {
    mockUserRepository.findAllUsers.mockRejectedValue(
      new Error('Database error'),
    );

    const result = await service.findAll();
    expect(result).toEqual({
      error: 'Database error',
      message: messages.INTERNAL_SERVER_ERROR,
      status: 500,
      success: false,
    });
  });
});