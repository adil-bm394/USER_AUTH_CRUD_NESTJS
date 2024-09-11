import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { messages } from '../../utils/messages/messages';
import { statusCodes } from '../../utils/statusCodes/statusCodes';
import { UserRepository } from '../../users/repositories/user.repository';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
     //console.log("token in Authmiddleware",token);

    if (!token) {
      return res.status(statusCodes.UNAUTHORIZED).json({
        success: false,
        message: messages.TOKEN_MISSING,
      });
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.userRepository.findById(decoded.id);

      //console.log("user in AuthMiddleware by decode",user);

      if (!user) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          message: messages.USER_NOT_FOUND,
        });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error(`[AuthMiddleware] Authentication error: ${error.message}`);
      return res.status(statusCodes.UNAUTHORIZED).json({
        success: false,
        message: messages.INVALID_TOKEN,
      });
    }
  }
}
