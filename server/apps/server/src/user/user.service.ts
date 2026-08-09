import { Injectable } from '@nestjs/common';
import type {
  UserLogin,
  UserRegister,
  Token,
  RefreshTokenPayload,
} from '@en/common/user';
import { PrismaService, ResponseService } from '@libs/shared';
import type { Prisma } from '@libs/shared/generated/prisma/client';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { userSelect } from './user.select';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  async login(createUserDto: UserLogin) {
    const user = await this.prisma.user.findUnique({
      where: { phone: createUserDto.phone },
    });
    if (!user) {
      return this.responseService.error(null, '手机号不存在');
    }
    if (user.password !== createUserDto.password) {
      return this.responseService.error(null, '密码不正确');
    }
    const updataUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: userSelect,
    });
    const token = this.authService.generateToken({
      userId: updataUser.id,
      name: updataUser.name,
      email: updataUser.email,
    });
    return this.responseService.success({ ...updataUser, token });
  }

  async register(createUserDto: UserRegister) {
    const data: Prisma.UserCreateInput = {
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: createUserDto.password,
      lastLoginAt: new Date(),
    };
    const user = await this.prisma.user.findUnique({
      where: { phone: createUserDto.phone },
    });
    if (user) {
      return this.responseService.error(null, '手机号已经存在');
    }
    if (createUserDto.email) {
      const emailUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });
      if (emailUser) {
        return this.responseService.error(null, '邮箱已经存在');
      }
      data.email = createUserDto.email;
    }
    const newUser = await this.prisma.user.create({
      data,
      select: userSelect,
    });
    const token = this.authService.generateToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
    return this.responseService.success({ ...newUser, token });
  }

  async refreshToken(createUserDto: Omit<Token, 'accessToken'>) {
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(
        createUserDto.refreshToken,
      );
      if (decoded.tokenType !== 'refresh') {
        return this.responseService.error(null, 'refreshToken已过期或无效');
      }
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) {
        return this.responseService.error(null, '用户不存在');
      }
      const token = this.authService.generateToken({
        userId: user.id,
        name: user.name,
        email: user.email,
      });
      return this.responseService.success(token);
    } catch {
      return this.responseService.error(null, 'refreshToken已过期或无效');
    }
  }
}
