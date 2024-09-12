import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { messages } from '../utils/messages/messages';
import { BaseResponse, ErrorResponse, LoginUserResponse, UserResponse } from '../utils/interfaces/types';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/repositories/user.repository';
import { statusCodes } from '../utils/statusCodes/statusCodes';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  //CREATE USER
  async create(userData: SignUpDto): Promise<UserResponse | BaseResponse |ErrorResponse> {
    try {
      const { email, password } = userData;

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return {
          status:statusCodes.BAD_REQUEST,
          success: false,
          message: messages.USER_ALREADY_EXIST,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const savedUser = await this.userRepository.createUser({
        ...userData,
        password: hashedPassword,
      });
      savedUser.password = undefined;

      return {
        status:statusCodes.CREATED,
        success: true,
        message: messages.USER_CREATED,
        user: savedUser,
      };
    } catch (error) {
      console.log(
        `[Auth.Service] Error creating user: ${error.message} || ${error}`,
      );
      return {
              status:statusCodes.INTERNAL_SERVER_ERROR,
               success: false,
               message:messages.INTERNAL_SERVER_ERROR,
               error:error.message,
      }
    }
  }

  //LOGIN SERVICE
  async login(userData: LoginDto): Promise< BaseResponse|LoginUserResponse |ErrorResponse> {
    try {
      const { email, password } = userData;

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          status:statusCodes.NOT_FOUND,
          success: false,
          message: messages.USER_NOT_FOUND,
        };
      }

      const isMatchedPassword = await bcrypt.compare(password, user.password);
      if (!isMatchedPassword) {
        return {
          status:statusCodes.UNAUTHORIZED,
          success: false,
          message: messages.INVALID_CREDENTIAL,
        };
      }

      const token = this.jwtService.sign({ id: user.id });

      return {
        status:statusCodes.OK,
        success: true,
        message: messages.USER_LOGIN,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          token,
        },
      };
    } catch (error) {
      console.log(`[Auth.Service] Error during login: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
