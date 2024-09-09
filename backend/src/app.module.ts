import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, UsersModule, JwtModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


