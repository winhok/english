import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { RefreshTokenPayload } from '@en/common/user';

interface AuthenticatedRequest extends Request {
  user?: RefreshTokenPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers;
    if (!header.authorization) {
      throw new UnauthorizedException('没有权限访问');
    }
    const token = header.authorization.split(' ')[1];
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(token);
      if (decoded.tokenType !== 'access') {
        throw new UnauthorizedException('token已过期或无效');
      }
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('token已过期或无效');
    }
  }
}
