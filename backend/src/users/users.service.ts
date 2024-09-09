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
  async create(signUpDto: SignUpDto): Promise<User> {
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

    return this.userRepository.save(user);
  }

  //LOGIN SERVICE
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where:{email }});

    if (!user) {
      throw new UnauthorizedException(messages.USER_NOT_FOUND);
    }

    const isMatchedPassword = await bcrypt.compare(password, user.password);
    if (!isMatchedPassword) {
      throw new UnauthorizedException(messages.INVALID_CREDENTIAL);
    }

    const token = this.jwtService.sign({ id: user._id });

    return {
      message: messages.USER_LOGIN,
      user: {
        id: user._id,
        name: user.email,
        email: user.email,
        token,
      },
    };
  }

  // GET ALL USERS
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // GET USER BY ID
  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  // UPDATE USER
  async update(id: number, updateDto: UpdateDto): Promise<void> {
    await this.userRepository.update(id, updateDto);
  }

  // DELETE USER
  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}





//==================================================================
// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { UserRepository } from './user.repository';
// import { User } from './users.entity';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(UserRepository)
//     private userRepository: UserRepository,
//   ) {}

//    //GET ALL USERS
//   async findAll(): Promise<User[]> {
//     return this.userRepository.find();
//   }

//   //GET USER BY ID
//   async findOne(id: number): Promise<User> {
//     return this.userRepository.findOne(id);
//   }

//   //CREATE NEW USER
//   async create(user: User): Promise<User> {
//     return this.userRepository.save(user);
//   }

//   //UPDATE USER
//   async update(id: number, user: Partial<User>): Promise<void> {
//     await this.userRepository.update(id, user);
//   }

//   //DELETE USER
//   async delete(id: number): Promise<void> {
//     await this.userRepository.delete(id);
//   }
// }
