import { User } from 'src/users/entities/users.entity';

export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface UserResponse extends BaseResponse {
  user: User;
}

export interface UsersListResponse extends BaseResponse {
  users: User[];
}

export interface LoginUserResponse extends BaseResponse {
  user: {
    id: number;
    name: string;
    email: string;
    token?: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: User; 
      
    }
  }
}