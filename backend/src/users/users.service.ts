import {
  Injectable,
} from '@nestjs/common';
import { messages } from '../utils/messages/messages';
import { UpdateDto } from './dto/update.dto';
import { UserRepository } from './repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BaseResponse,
  ErrorResponse,
  UserResponse,
  UsersListResponse,
} from '../utils/interfaces/types';
import { statusCodes } from '../utils/statusCodes/statusCodes';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  // GET ALL USERS
  async findAll(): Promise<BaseResponse | UsersListResponse | ErrorResponse> {
    try {
      const users = await this.userRepository.findAllUsers();

      users.forEach((user) => {
        user.password = undefined;
      });

      return {
        status: statusCodes.OK,
        success: true,
        message: messages.USER_FETCHED,
        users,
      };
    } catch (error) {
      console.log(`[Users.Service] Error in fetching All Users: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // GET USER BY ID
  async findOne(
    id: number,
    currentUserId: number,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: messages.USER_NOT_FOUND,
        };
      }

      if (user.id !== currentUserId) {
        return {
          status: statusCodes.UNAUTHORIZED,
          success: false,
          message: messages.ACCESS_NOT_ALLOWED,
        };
      }

      user.password = undefined;
      return {
        status: statusCodes.OK,
        success: true,
        message: messages.USER_FETCHED,
        user: user,
      };
    } catch (error) {
      console.error(`[Users.Service] Error in fetching Users BY ID: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // UPDATE USER
  async update(
    id: number,
    updatedData: UpdateDto,
    currentUserId: number,
  ): Promise<UserResponse | BaseResponse |ErrorResponse> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        return {
          status:statusCodes.NOT_FOUND,
          success: false,
          message: messages.USER_NOT_FOUND,
        };
      }

      if (user.id !== currentUserId) {
        return {
          status: statusCodes.UNAUTHORIZED,
          success: false,
          message: messages.UPDATE_NOT_ALLOWED,
        };
      }

      await this.userRepository.updateUser(id, updatedData);

      const updatedUser = await this.userRepository.findById(id);
      updatedUser.password = undefined;
      return {
        status:statusCodes.OK,
        success: true,
        message: messages.USER_UPDATED,
        user: updatedUser,
      };
    } catch (error) {
      console.error(`[Users.Service] Error in Updating Users: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // DELETE USER (SOFT DELETE)
  async delete(id: number, currentUserId: number): Promise<BaseResponse | ErrorResponse> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return {
          status:statusCodes.NOT_FOUND,
          success: false,
          message: messages.USER_NOT_FOUND,
        };
      }

      if (user.id !== currentUserId) {
        return {
          status: statusCodes.UNAUTHORIZED,
          success: false,
          message: messages.DELETE_NOT_ALLOWED,
        };
      }

      await this.userRepository.softDeleteUser(id);
      return {
        status:statusCodes.OK,
        success: true,
        message: messages.USER_DELETED,
      };
    } catch (error) {
      console.error(`[Users.Service] Error in Soft Delete Users: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
