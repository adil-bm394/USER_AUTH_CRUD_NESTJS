import { User } from '../entities/users.entity';

export class BaseResponseDto {
  success: boolean;
  message: string;
}

export class UserResponseDto extends BaseResponseDto {
  user: User;
}

export class UsersListResponseDto extends BaseResponseDto {
  users: User[];
}
export class LoginUserResponseDto extends BaseResponseDto {
  user: {
    id: number;
    name: string;
    email: string;
    token?: string;
  };
}
