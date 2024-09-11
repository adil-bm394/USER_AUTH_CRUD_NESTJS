import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponse, LoginUserResponse } from '../utils/interfaces/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<UserResponse> {
    return this.authService.create(signUpDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<LoginUserResponse> {
    return this.authService.login(loginDto);
  }
}
