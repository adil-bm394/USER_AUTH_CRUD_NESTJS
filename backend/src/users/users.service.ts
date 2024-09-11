import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { messages } from '../utils/messages/messages';
import { UpdateDto } from './dto/update.dto';
import { UserRepository } from './repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BaseResponse,
  UserResponse,
  UsersListResponse,
} from 'src/utils/interfaces/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  // GET ALL USERS
  async findAll(): Promise<UsersListResponse> {
    try {
      const users = await this.userRepository.findAllUsers();

      users.forEach((user) => {
        user.password = undefined;
      });

      return {
        success: true,
        message: messages.USER_FETCHED,
        users,
      };
    } catch (error) {
      console.log(`[Users.Service] Error in fetching All Users: ${error}`);
      throw new InternalServerErrorException(messages.INTERNAL_SERVER_ERROR);
    }
  }

  // GET USER BY ID
  async findOne(id: number): Promise<UserResponse | BaseResponse> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        return {
          success: false,
          message: messages.USER_NOT_FOUND,
        };
      }
      user.password = undefined;
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
  ): Promise<UserResponse | BaseResponse> {
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
      updatedUser.password = undefined;
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
  async delete(id: number): Promise<BaseResponse> {
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
