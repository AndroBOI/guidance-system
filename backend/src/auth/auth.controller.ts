import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  @Post('signin')
  signIn(@Body() authDto: AuthDto) {
    return { message: 'User signed in', data: authDto };
  }
}
