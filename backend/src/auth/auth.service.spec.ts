import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../users/repositories/user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { messages } from '../utils/messages/messages';
import * as bcrypt from 'bcrypt';

const mockUserRepository = {
  findByEmail: jest.fn(),
  createUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const signUpDto = {
      name: 'Mohd Adil',
      email: 'adil@binmile.com',
      password: '123456',
      address: 'Azamgarh',
    };

    const user = { ...signUpDto, id: 1 };

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.createUser.mockResolvedValue(user);

    expect(await service.create(signUpDto)).toEqual({
      success: true,
      message: messages.USER_CREATED,
      user,
    });
  });

  it('should throw ConflictException if user already exists', async () => {
    const signUpDto = {
      name: 'Mohd Adil',
      email: 'adil@binmile.com',
      password: '123456',
      address: 'Azamgarh',
    };

    mockUserRepository.findByEmail.mockResolvedValue(signUpDto);

    await expect(service.create(signUpDto)).rejects.toThrow(ConflictException);
  });

  it('should throw InternalServerErrorException on creation error', async () => {
    const signUpDto = {
      name: 'Mohd Adil',
      email: 'adil@binmile.com',
      password: '123456',
      address: 'Azamgarh',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.createUser.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(service.create(signUpDto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should login a user', async () => {
    const loginDto = {
      email: 'adil@binmile.com',
      password: '123456',
    };

    const user = {
      id: 1,
      email: 'adil@binmile.com',
      password: 'hashed-password',
    };

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    mockUserRepository.findByEmail.mockResolvedValue(user);

    const result = await service.login(loginDto);

    expect(result).toEqual({
      success: true,
      message: messages.USER_LOGIN,
      user: {
        id: user.id,
        name: user.email,
        email: user.email,
        token: 'mock-token',
      },
    });
  });

  it('should throw UnauthorizedException on invalid credentials', async () => {
    const loginDto = {
      email: 'adil@binmile.com',
      password: 'wrongpassword',
    };

    const user = {
      id: 1,
      email: 'adil@binmile.com',
      password: 'hashed-password',
    };

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    mockUserRepository.findByEmail.mockResolvedValue(user);

    await expect(service.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if user not found', async () => {
    const loginDto = {
      email: 'nonexistent@binmile.com',
      password: '123456',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(service.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw InternalServerErrorException on login error', async () => {
    const loginDto = {
      email: 'adil@binmile.com',
      password: '123456',
    };

    mockUserRepository.findByEmail.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(service.login(loginDto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
