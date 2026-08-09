import { Injectable } from '@nestjs/common';
import type { UserLogin, UserRegister } from '@en/common/user';
import { PrismaService, ResponseService } from '@libs/shared';
import type { Prisma } from '@libs/shared/generated/prisma/client';

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  wordNumber: true,
  dayNumber: true,
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
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
    return this.responseService.success(updataUser);
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
    return this.responseService.success(newUser);
  }
}
