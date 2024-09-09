import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Adil@123',
      database: 'userauth_crud',
      entities: [User],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
