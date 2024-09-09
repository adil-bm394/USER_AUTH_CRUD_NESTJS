// src/users/users.service.ts

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './users.entity';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { messages } from 'src/utils/messages'; // Ensure this path is correct
import { UpdateDto } from './dto/update.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto, LoginUserResponseDto, BaseResponseDto } from './dto/response.dto';

@Injectable()
export class UsersService {
  private userRepository;

  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  // CREATE NEW USER
  async create(signUpDto: SignUpDto): Promise<UserResponseDto> {
    const { email, password } = signUpDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(messages.USER_ALREADY_EXIST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...signUpDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: messages.USER_CREATED,
      user: savedUser,
    };
  }

  //LOGIN SERVICE
  async login(loginDto: LoginDto): Promise<LoginUserResponseDto> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException(messages.USER_NOT_FOUND);
    }

    const isMatchedPassword = await bcrypt.compare(password, user.password);
    if (!isMatchedPassword) {
      throw new UnauthorizedException(messages.INVALID_CREDENTIAL);
    }

    const token = this.jwtService.sign({ id: user._id });

    return {
      success: true,
      message: messages.USER_LOGIN,
      user: {
        id: user.id,
        name: user.email,
        email: user.email,
        token,
      },
    };
  }

  // GET ALL USERS
  async findAll(): Promise<UserResponseDto> {
    const users = await this.userRepository.find();
    return {
      success: true,
      message: messages.USER_FETCHED,
      user: users,
    };
  }

  // GET USER BY ID
  async findOne(id: number): Promise<UserResponseDto | BaseResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        message: messages.USER_NOT_FOUND,
      };
    }

    return {
      success: true,
      message: messages.USER_FETCHED,
      user: user,
    };
  }

  // UPDATE USER
  async update(
    id: number,
    updateDto: UpdateDto,
  ): Promise<UserResponseDto | BaseResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        message: messages.USER_NOT_FOUND,
      };
    }
    await this.userRepository.update(id, updateDto);

    const updatedUser = await this.userRepository.findOne({
      where: { id },
    });
    return {
      success: true,
      message: messages.USER_UPDATED,
      user: updatedUser,
    };
  }

  // DELETE USER
  async delete(id: number): Promise<BaseResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        message: messages.USER_NOT_FOUND,
      };
    }
    await this.userRepository.delete(id);
    return {
      success: true,
      message: messages.USER_DELETED, 
    };
  }
}





