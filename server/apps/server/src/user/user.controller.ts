import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import type {
  UserLogin,
  UserRegister,
  Token,
  UserUpdate,
} from '@en/common/user';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import type { Request } from 'express';

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

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadAvatar(file);
  }

  @UseGuards(AuthGuard)
  @Post('update-user')
  updateUser(@Body() createUserDto: UserUpdate, @Req() req: Request) {
    const user = req.user;
    return this.userService.updateUser(createUserDto, user);
  }
}
