import { Controller, Get, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateDto } from './dto/update.dto';
import {
  BaseResponse,
  ErrorResponse,
  UserResponse,
  UsersListResponse,
} from 'src/utils/interfaces/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //GET ALL USER
  @Get()
  findAll(): Promise<BaseResponse | UsersListResponse | ErrorResponse> {
    return this.usersService.findAll();
  }

  // GET USER BY ID
  @Get(':id')
  findOne(
    @Param('id') id: number,
    @Req() req,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    const currentUserId = req.user.id;
    return this.usersService.findOne(id, currentUserId);
  }

  // UPDATE USER
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateDto,
    @Req() req,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    const currentUserId = req.user.id;
    return this.usersService.update(id, updateDto, currentUserId);
  }

  // DELETE USER
  @Delete(':id')
  remove(@Param('id') id: number, @Req() req): Promise<BaseResponse|ErrorResponse> {
    const currentUserId = req.user.id;
    return this.usersService.delete(id, currentUserId);
  }
}
