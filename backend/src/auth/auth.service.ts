import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { messages } from '../utils/messages/messages';
import { LoginUserResponse, UserResponse } from 'src/utils/interfaces/types';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  //CREATE USER
  async create(signUpDto: SignUpDto): Promise<UserResponse> {
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
      savedUser.password = undefined;

      return {
        success: true,
        message: messages.USER_CREATED,
        user: savedUser,
      };
    } catch (error) {
      console.log(
        `[Auth.Service] Error creating user: ${error.message} || ${error}`,
      );
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException(messages.INTERNAL_SERVER_ERROR);
      }
    }
  }

  //LOGIN SERVICE
  async login(loginDto: LoginDto): Promise<LoginUserResponse> {
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
      console.log(`[Auth.Service] Error during login: ${error}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException(messages.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
