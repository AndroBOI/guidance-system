import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() authDto: AuthDto) {
    return this.authService.signUp(authDto.email, authDto.password);
  }

  @Post('signin')
  signIn(@Body() authDto: AuthDto) {
    return this.authService.singIn(authDto.email, authDto.password);
  }
}
