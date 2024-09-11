import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/users.entity';
import { SignUpDto } from '../auth/dto/signup.dto';
import { UpdateDto } from './dto/update.dto';
import { LoginDto } from '../auth/dto/login.dto';
import {
  BaseResponse,
  LoginUserResponse,
  UserResponse,
  UsersListResponse,
} from 'src/utils/interfaces/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //GET ALL USER
  @Get()
  findAll(): Promise<UsersListResponse> {
    return this.usersService.findAll();
  }

  //   //GET USER BY ID
  @Get(':id')
  findOne(@Param('id') id: number): Promise<UserResponse | BaseResponse> {
    return this.usersService.findOne(id);
  }

  //UPDATE USER
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateDto,
  ): Promise<UserResponse | BaseResponse> {
    return this.usersService.update(id, updateDto);
  }

  //DELETE USER
  @Delete(':id')
  remove(@Param('id') id: number): Promise<BaseResponse> {
    return this.usersService.delete(id);
  }
}
