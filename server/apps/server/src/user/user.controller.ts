import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import type { UserLogin, UserRegister, Token } from '@en/common/user';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  login(@Body() createUserDto: UserLogin) {
    return this.userService.login(createUserDto);
  }

  @Post('register')
  register(@Body() createUserDto: UserRegister) {
    return this.userService.register(createUserDto);
  }

  @Post('refresh-token')
  refreshToken(@Body() createUserDto: Omit<Token, 'accessToken'>) {
    return this.userService.refreshToken(createUserDto);
  }
}
