import { User } from "../users.entity";

export class BaseResponseDto {
  success:boolean;
  message: string;
}

export class UserResponseDto extends BaseResponseDto {
  user:User;
}

export class LoginUserResponseDto extends BaseResponseDto {
  user: {
    id: number;
    name: string;
    email: string;
    token?: string; 
  };
}

// export class UserUpdateResponseDto extends BaseResponseDto {
//   user: User;
// }
