import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/users.entity';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { messages } from 'src/utils/messages';
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
  }

  //LOGIN SERVICE
  async login(loginDto: LoginDto): Promise<LoginUserResponseDto> {
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
  }

  // GET ALL USERS
  async findAll(): Promise<UsersListResponseDto> {
    const users = await this.userRepository.findAllUsers();
    return {
      success: true,
      message: messages.USER_FETCHED,
      users,
    };
  }

  // GET USER BY ID
  async findOne(id: number): Promise<UserResponseDto | BaseResponseDto> {
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
  }

  // UPDATE USER
  async update(
    id: number,
    updateDto: UpdateDto,
  ): Promise<UserResponseDto | BaseResponseDto> {
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
  }

  // DELETE USER (SOFT DELETE)
  async delete(id: number): Promise<BaseResponseDto> {
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
  }
}
