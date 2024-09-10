import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { SignUpDto } from '../dto/signup.dto';
import { UpdateDto } from '../dto/update.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.manager);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async createUser(signUpDto: SignUpDto): Promise<User> {
    const user = this.create(signUpDto);
    return this.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return this.find();
  }

  async updateUser(id: number, updateDto: UpdateDto): Promise<void> {
    await this.update(id, updateDto);
  }

  async softDeleteUser(id: number): Promise<void> {
    await this.update(id, { deletedAt: new Date() });
  }
}
