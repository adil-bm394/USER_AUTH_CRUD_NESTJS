import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/users.entity';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { messages } from '../utils/messages';
import { UpdateDto } from './dto/update.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import {
  UserResponseDto,
  LoginUserResponseDto,
  BaseResponseDto,
  UsersListResponseDto,
} from './dto/response.dto';
import { UserRepository } from './repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  // CREATE NEW USER
  async create(signUpDto: SignUpDto): Promise<UserResponseDto> {
    try {
      const { email, password } = signUpDto;

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictException(messages.USER_ALREADY_EXIST);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const savedUser = await this.userRepository.createUser({
        ...signUpDto,
        password: hashedPassword,
      });

      return {
        success: true,
        message: messages.USER_CREATED,
        user: savedUser,
      };
    } catch (error) {
      console.error(`[Users.Service]Error creating user:${error}`);
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException(messages.INTERNAL_SERVER_ERROR);
      }
    }
  }

  //LOGIN SERVICE
  async login(loginDto: LoginDto): Promise<LoginUserResponseDto> {
    try {
      const { email, password } = loginDto;

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException(messages.USER_NOT_FOUND);
      }

      const isMatchedPassword = await bcrypt.compare(password, user.password);
      if (!isMatchedPassword) {
        throw new UnauthorizedException(messages.INVALID_CREDENTIAL);
      }

      const token = this.jwtService.sign({ id: user.id });

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
    } catch (error) {
      console.error(`[Users.Service]Error during login:${error}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException(messages.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // GET ALL USERS
  async findAll(): Promise<UsersListResponseDto> {
    try {
      const users = await this.userRepository.findAllUsers();
      return {
        success: true,
        message: messages.USER_FETCHED,
        users,
      };
    } catch (error) {
      console.error(`[Users.Service] Error in fetching All Users: ${error}`);
      throw new InternalServerErrorException(messages.INTERNAL_SERVER_ERROR);
    }
  }

  // GET USER BY ID
  async findOne(id: number): Promise<UserResponseDto | BaseResponseDto> {
    try {
      const user = await this.userRepository.findById(id);

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
    } catch (error) {
      console.error(`[Users.Service] Error in fetching  Users BY ID: ${error}`);
      throw new InternalServerErrorException(messages.INTERNAL_SERVER_ERROR);
    }
  }

  // UPDATE USER
  async update(
    id: number,
    updateDto: UpdateDto,
  ): Promise<UserResponseDto | BaseResponseDto> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        return {
          success: false,
          message: messages.USER_NOT_FOUND,
        };
      }
      await this.userRepository.updateUser(id, updateDto);

      const updatedUser = await this.userRepository.findById(id);
      return {
        success: true,
        message: messages.USER_UPDATED,
        user: updatedUser,
      };
    } catch (error) {
      console.error(`[Users.Service] Error in Updating  Users: ${error}`);
      throw new InternalServerErrorException(messages.INTERNAL_SERVER_ERROR);
    }
  }

  // DELETE USER (SOFT DELETE)
  async delete(id: number): Promise<BaseResponseDto> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return {
          success: false,
          message: messages.USER_NOT_FOUND,
        };
      }
      await this.userRepository.softDeleteUser(id);
      return {
        success: true,
        message: messages.USER_DELETED,
      };
    } catch (error) {
      console.error(`[Users.Service] Error in Soft Delete  Users: ${error}`);
      throw new InternalServerErrorException(messages.INTERNAL_SERVER_ERROR);
    }
  }
}
