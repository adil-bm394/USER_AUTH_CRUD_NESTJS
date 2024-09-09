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
import { User } from './users.entity';
import { SignUpDto } from './dto/signup.dto';
import { UpdateDto } from './dto/update.dto';
import { LoginDto } from './dto/login.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CREATE USER
  @Post()
  async create(@Body() signUpDto: SignUpDto): Promise<User> {
    return this.usersService.create(signUpDto);
  }

  //LOGIN USER
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  //GET ALL USER
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  //GET USER BY ID
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  //UPDATE USER
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateDto,
  ): Promise<void> {
    await this.usersService.update(id, updateDto);
  }

  //DELETE USER
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.delete(id);
  }
}
